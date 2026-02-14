'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

export default function Dashboard() {
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let channel: any

    const init = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push('/')
        return
      }

      setUser(data.user)
      await fetchBookmarks(data.user.id)
      setLoading(false)

      channel = supabase
        .channel('bookmarks-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bookmarks',
            filter: `user_id=eq.${data.user.id}`
          },
          () => {
            fetchBookmarks(data.user.id)
          }
        )
        .subscribe()
    }

    init()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [router])

  const fetchBookmarks = async (userId: string) => {
    const { data } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (data) setBookmarks(data)
  }

  const addBookmark = async () => {
    if (!user) return

    if (!title || !url) {
      alert('Please fill all fields')
      return
    }

    await supabase.from('bookmarks').insert([
      {
        user_id: user.id,
        title,
        url
      }
    ])

    setTitle('')
    setUrl('')
  }

  const deleteBookmark = async (id: number) => {
    await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-10">

      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            📚 Smart Bookmarks
          </h1>

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 transition text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>

        {/* Add Bookmark */}
        <div className="flex gap-3 mb-8">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Website title"
            className="border p-2 flex-1 rounded"
          />

          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="border p-2 flex-1 rounded"
          />

          <button
            onClick={addBookmark}
            className="bg-blue-600 hover:bg-blue-700 transition text-white px-5 rounded"
          >
            Add
          </button>
        </div>

        {/* Bookmark List */}
        {bookmarks.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            No bookmarks yet. Add your first one 🚀
          </div>
        ) : (
          <div className="space-y-4">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="bg-white shadow-sm border rounded-lg p-4 flex justify-between items-center"
              >
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 font-semibold hover:underline"
                >
                  {bookmark.title}
                </a>

                <button
                  onClick={() => deleteBookmark(bookmark.id)}
                  className="text-red-500 hover:text-red-700 transition"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
