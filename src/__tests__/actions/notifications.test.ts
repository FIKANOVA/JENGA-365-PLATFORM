import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/auth/config', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}))

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}))

vi.mock('@/lib/notifications/service', () => ({
  getUnreadNotifications: vi.fn(),
  getUnreadCount: vi.fn(),
  markAsRead: vi.fn(),
  markAllAsRead: vi.fn(),
}))

import { getNotificationsAction, getUnreadCountAction } from '@/lib/actions/notifications'
import { auth } from '@/lib/auth/config'
import { getUnreadNotifications, getUnreadCount } from '@/lib/notifications/service'

describe('Notifications Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getNotificationsAction', () => {
    it('returns empty array when session is null', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as any)

      const result = await getNotificationsAction()

      expect(result).toEqual([])
      expect(getUnreadNotifications).not.toHaveBeenCalled()
    })

    it('returns empty array when user is not in session', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({} as any)

      const result = await getNotificationsAction()

      expect(result).toEqual([])
      expect(getUnreadNotifications).not.toHaveBeenCalled()
    })

    it('calls getUnreadNotifications with user id and default limit when session is valid', async () => {
      const mockUser = { id: 'user-123' }
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockUser } as any)

      const mockNotifications = [
        { id: 'notif-1', userId: 'user-123', type: 'general', title: 'Test 1', body: 'Body 1', createdAt: new Date() },
        { id: 'notif-2', userId: 'user-123', type: 'general', title: 'Test 2', body: 'Body 2', createdAt: new Date() }
      ]
      vi.mocked(getUnreadNotifications).mockResolvedValueOnce(mockNotifications as any)

      const result = await getNotificationsAction()

      expect(result).toEqual(mockNotifications)
      expect(getUnreadNotifications).toHaveBeenCalledOnce()
      expect(getUnreadNotifications).toHaveBeenCalledWith('user-123', 10)
    })
  })

  describe('getUnreadCountAction', () => {
    it('returns 0 when session is null', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as any)

      const result = await getUnreadCountAction()

      expect(result).toBe(0)
      expect(getUnreadCount).not.toHaveBeenCalled()
    })

    it('returns 0 when user is not in session', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({} as any)

      const result = await getUnreadCountAction()

      expect(result).toBe(0)
      expect(getUnreadCount).not.toHaveBeenCalled()
    })

    it('calls getUnreadCount with user id when session is valid', async () => {
      const mockUser = { id: 'user-123' }
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockUser } as any)

      const mockCount = 5
      vi.mocked(getUnreadCount).mockResolvedValueOnce(mockCount)

      const result = await getUnreadCountAction()

      expect(result).toBe(mockCount)
      expect(getUnreadCount).toHaveBeenCalledOnce()
      expect(getUnreadCount).toHaveBeenCalledWith('user-123')
    })
  })
})
