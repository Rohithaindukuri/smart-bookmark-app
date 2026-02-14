'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        router.push('/dashboard')
      }
    }

    checkSession()
  }, [router])

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-xl p-10 text-center w-[420px]">

        {/* Title + Emoji in ONE line */}
        <h1 className="text-3xl font-bold mb-3 whitespace-nowrap">
          Smart Bookmark App 🚀
        </h1>

        {/* Description in ONE line below */}
        <p className="text-gray-600 mb-6 whitespace-nowrap">
          Save and manage your favourite websites securely.
        </p>

        <button
          onClick={handleLogin}
          className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-3 rounded-lg text-lg w-full"
        >
          Login with Google
        </button>

      </div>
    </div>
  )
}
