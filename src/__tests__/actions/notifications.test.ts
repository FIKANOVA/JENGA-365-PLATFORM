import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
    getNotificationsAction,
    getUnreadCountAction,
    markNotificationReadAction,
    markAllNotificationsReadAction
} from '@/lib/actions/notifications'
import * as service from '@/lib/notifications/service'
import { auth } from '@/lib/auth/config'

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}))

vi.mock('@/lib/auth/config', () => ({
  auth: {
    api: { getSession: vi.fn() },
  },
}))


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

  describe('markNotificationReadAction', () => {
    it('throws UNAUTHORIZED when session is null', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as any)
      await expect(markNotificationReadAction('notif-1'))
        .rejects.toThrow('UNAUTHORIZED')
    })

    it('calls markAsRead and returns success when authenticated', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: 'user-1' } } as any)

      const result = await markNotificationReadAction('notif-1')

      expect(service.markAsRead).toHaveBeenCalledWith('notif-1', 'user-1')
      expect(result).toEqual({ success: true })
    })
  })

  describe('getNotificationsAction', () => {
    it('returns empty array when session is null', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as any)
      const result = await getNotificationsAction()
      expect(result).toEqual([])
    })

    it('calls getUnreadNotifications when authenticated', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: 'user-1' } } as any)
      vi.mocked(service.getUnreadNotifications).mockResolvedValueOnce([{ id: 'notif-1' }] as any)

      const result = await getNotificationsAction()

      expect(service.getUnreadNotifications).toHaveBeenCalledWith('user-1', 10)
      expect(result).toEqual([{ id: 'notif-1' }])
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
    })

    it('calls getUnreadCount when authenticated', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: 'user-1' } } as any)
      vi.mocked(service.getUnreadCount).mockResolvedValueOnce(5)

      const result = await getUnreadCountAction()

      expect(service.getUnreadCount).toHaveBeenCalledWith('user-1')
      expect(result).toBe(5)
    })
  })

  describe('markAllNotificationsReadAction', () => {
    it('throws UNAUTHORIZED when session is null', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as any)
      await expect(markAllNotificationsReadAction())
        .rejects.toThrow('UNAUTHORIZED')
    })

    it('calls markAllAsRead and returns success when authenticated', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: 'user-1' } } as any)

      const result = await markAllNotificationsReadAction()

      expect(service.markAllAsRead).toHaveBeenCalledWith('user-1')
      expect(result).toEqual({ success: true })

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
