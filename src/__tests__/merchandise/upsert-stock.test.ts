import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockFindFirst, mockSelect, mockUpdate, mockInsert, mockFetch, mockRequireCapability, mockRevalidatePath } = vi.hoisted(() => {
  return {
    mockFindFirst: vi.fn(),
    mockSelect: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve([])),
      })),
    })),
    mockUpdate: vi.fn(),
    mockInsert: vi.fn(),
    mockFetch: vi.fn(),
    mockRequireCapability: vi.fn(),
    mockRevalidatePath: vi.fn()
  }
})

vi.mock('@/lib/auth/guard', () => ({
  requireCapability: mockRequireCapability
}))

vi.mock('@/lib/sanity/client', () => ({
  client: { fetch: mockFetch }
}))

vi.mock('next/cache', () => ({
  revalidatePath: mockRevalidatePath
}))

vi.mock('@/lib/db', () => ({
  db: {
    query: { merchandise: { findFirst: mockFindFirst } },
    select: mockSelect,
    update: mockUpdate,
    insert: mockInsert,
  },
}))

vi.mock('@/lib/db/schema', () => ({
  merchandise: {
    name: 'merchandise',
    stockCount: 'stockCount',
    sanityProductId: 'sanityProductId',
    isActive: 'isActive'
  },
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((col, val) => ({ col, val })),
  and: vi.fn(() => 'and'),
  gt: vi.fn(() => 'gt'),
  sql: vi.fn((s) => ({ sql: s })),
  inArray: vi.fn((col, val) => ({ inArray: { col, val } })),
}))

import { upsertMerchandiseStock } from '@/lib/actions/merchandise'

beforeEach(() => {
  vi.clearAllMocks()

  // Default mocks setup
  mockRequireCapability.mockResolvedValue(undefined)

  mockUpdate.mockReturnValue({
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue([{ id: 'merch-1' }]),
    }),
  })

  mockInsert.mockReturnValue({
    values: vi.fn().mockResolvedValue([{ id: 'merch-new' }])
  })
})

describe('upsertMerchandiseStock', () => {
  it('throws an error if requireCapability fails', async () => {
    mockRequireCapability.mockRejectedValue(new Error('Unauthorized'))

    await expect(upsertMerchandiseStock()).rejects.toThrow('Unauthorized')

    expect(mockRequireCapability).toHaveBeenCalledWith('UPSERT_MERCHANDISE_STOCK')
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('skips products missing required fields and logs an error', async () => {
    mockFetch.mockResolvedValue([
      { _id: 'prod-1', title: 'Valid Product', price: 10 },
      { _id: 'prod-2', title: 'Missing Price' },
      { title: 'Missing ID', price: 20 },
      { _id: 'prod-3', price: 30 } // Missing title
    ])

    mockFindFirst.mockResolvedValue(null) // Make the valid product insert

    const result = await upsertMerchandiseStock()

    expect(result.productsProcessed).toBe(4)
    expect(result.skipped).toBe(3)
    expect(result.inserted).toBe(1)
    expect(result.errors).toHaveLength(3)
    expect(result.errors[0]).toContain('missing required fields')
  })

  it('inserts new product with stockCount 0 when it does not exist', async () => {
    const newProduct = {
      _id: 'prod-new',
      title: 'New Product',
      price: 25,
      description: 'Test description',
      isActive: true,
      mainImageUrl: 'https://example.com/image.png',
      galleryUrls: ['https://example.com/gallery1.png', null],
      variants: [
        { sku: 'v1', label: 'Variant 1', size: 'M' },
        { sku: 'v2' } // missing label
      ]
    }

    mockFetch.mockResolvedValue([newProduct])

    // Simulate select returning empty array (not existing)
    mockSelect.mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve([])),
      })),
    })

    const mockValues = vi.fn().mockResolvedValue([{ id: 'merch-new' }])
    mockInsert.mockReturnValue({ values: mockValues })

    const result = await upsertMerchandiseStock()

    expect(result.inserted).toBe(1)
    expect(result.updated).toBe(0)
    expect(mockSelect).toHaveBeenCalledTimes(1)

    expect(mockInsert).toHaveBeenCalledTimes(1)
    expect(mockValues).toHaveBeenCalledWith(expect.objectContaining({
      sanityProductId: 'prod-new',
      name: 'New Product',
      price: '25',
      stockCount: 0,
      description: 'Test description',
      isActive: true,
      imageUrl: 'https://example.com/image.png',
      imageGallery: ['https://example.com/gallery1.png'],
      variants: [{ sku: 'v1', label: 'Variant 1', size: 'M' }]
    }))
  })

  it('updates existing product preserving stockCount', async () => {
    const existingProduct = {
      _id: 'prod-existing',
      title: 'Updated Title',
      price: 30,
      isActive: false
    }

    mockFetch.mockResolvedValue([existingProduct])

    // Simulate select returning the existing product
    mockSelect.mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve([{ sanityProductId: 'prod-existing' }])),
      })),
    })

    const mockSet = vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue([{ id: 'db-id-1' }])
    })
    mockUpdate.mockReturnValue({ set: mockSet })

    const result = await upsertMerchandiseStock()

    expect(result.updated).toBe(1)
    expect(result.inserted).toBe(0)
    expect(mockUpdate).toHaveBeenCalledTimes(1)

    expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Updated Title',
      price: '30',
      isActive: false
    }))

    // Check that stockCount is not in the set object
    const setCallArgs = mockSet.mock.calls[0][0]
    expect(setCallArgs).not.toHaveProperty('stockCount')
  })

  it('catches database errors and continues syncing other products', async () => {
    mockFetch.mockResolvedValue([
      { _id: 'prod-fail', title: 'Failing Product', price: 10 },
      { _id: 'prod-success', title: 'Successful Product', price: 20 }
    ])

    // Simulate select returning empty array for both (neither exists)
    mockSelect.mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve([])),
      })),
    })

    const mockValues = vi.fn()
      .mockRejectedValueOnce(new Error('DB Error'))
      .mockResolvedValueOnce([{ id: 'merch-success' }])
    mockInsert.mockReturnValue({ values: mockValues })

    const result = await upsertMerchandiseStock()

    expect(result.skipped).toBe(1)
    expect(result.inserted).toBe(1)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]).toContain('Failed to sync Failing Product')
    expect(result.errors[0]).toContain('DB Error')
  })

  it('calls revalidatePath for shop and inventory routes', async () => {
    mockFetch.mockResolvedValue([])

    await upsertMerchandiseStock()

    expect(mockRevalidatePath).toHaveBeenCalledWith('/shop')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard/moderator/inventory')
  })
})
