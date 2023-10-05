'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export default function Home() {
  const [csrfToken, setToken] = useState();
  const session = useSession();
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    fetch('/api/auth/csrf')
      .then((res) => res.json())
      .then((data) => {
        setToken(data['csrfToken'])
        setLoading(false)
      })
  }, [])

  console.log(session)

  return (
    <div className="mx-2 flex flex-col items-start">
      <img className="w-full" src="https://cdn.discordapp.com/attachments/856213034716758036/1158702564141973534/IMG_3414.JPG?ex=651d355a&is=651be3da&hm=89d37764da8debf72db294ea8fc268e650301a76912d7966280fa016eced23c8&"></img>
      <div className="w-full flex flex-col md:flex-row mt-4">
        <div className="overflow-x-auto flex-grow">
          <table className="table">
            <thead>
              <tr>
                <th>Date Range</th>
                <th>Plan</th>
              </tr>
            </thead>
            <tbody>
              {/* fill with schedules from settings */}
              <tr>
                <th>3 Oct - 10 Oct</th>
                <th>Beep Boop</th>
              </tr>
              <tr>
                <th>3 Oct - 10 Oct</th>
                <th>Beep Boop</th>
              </tr>
              <tr>
                <th>3 Oct - 10 Oct</th>
                <th>Beep Boop</th>
              </tr>
              <tr>
                <th>3 Oct - 10 Oct</th>
                <th>Beep Boop</th>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="divider md:divider-horizontal"></div>
        <div className="flex-grow mx-auto">
          <form action="/api/auth/signin/osu" className="w-full" method="POST">
            <input type="hidden" name="csrfToken" value={csrfToken}></input>
            <input type="hidden" name="callbackUrl" value={process.env.NEXTAUTH_URL}></input>
            {(loading == true) ? (
              <button disabled className="btn md:btn-block normal-case disabled:bg-white text-black">
                <span className="loading loading-spinner text-black"></span>
              </button>
            ) : (session.status == "authenticated") ? (
              <div className='w-full flex items-center justify-center'>
                <p>Welcome {session.data.user.name}</p>
              </div>
            ) : (
              <button type="submit" className="btn md:btn-block normal-case bg-white text-black fill-black hover:fill-white hover:bg-primary hover:text-white">
                <svg className="h-7 w-7" id="Working_Image" data-name="Working Image" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
                  <path id="osu__txt_Path" data-name="osu!_txt_Path" d="m75.1,181.4c-4.7,0-8.8-.8-12.3-2.3-3.5-1.5-6.4-3.7-8.6-6.4-2.3-2.7-4-5.9-5.2-9.6-1.2-3.7-1.7-7.6-1.7-11.9s.6-8.3,1.7-12c1.2-3.7,2.9-7,5.2-9.7s5.2-4.9,8.6-6.5c3.5-1.6,7.6-2.4,12.3-2.4s8.8.8,12.3,2.4,6.4,3.7,8.8,6.5c2.3,2.7,4,6,5.2,9.7,1.1,3.7,1.7,7.7,1.7,12s-.6,8.2-1.7,11.9-2.8,6.9-5.2,9.6c-2.3,2.7-5.2,4.9-8.8,6.4-3.4,1.6-7.6,2.3-12.3,2.3Zm0-12.1c4.2,0,7.2-1.6,9-4.7,1.8-3.1,2.7-7.6,2.7-13.4s-.9-10.3-2.7-13.4c-1.8-3.1-4.8-4.7-9-4.7s-7.1,1.6-8.9,4.7c-1.8,3.1-2.7,7.6-2.7,13.4s.9,10.3,2.7,13.4c1.8,3.2,4.8,4.7,8.9,4.7Zm51.8-14.5c-4.2-1.2-7.5-3-9.8-5.3-2.4-2.4-3.5-5.9-3.5-10.6,0-5.7,2-10.1,6.1-13.4,4.1-3.2,9.6-4.8,16.7-4.8,2.9,0,5.8.3,8.6.8s5.7,1.3,8.6,2.4c-.2,1.9-.5,4-1.1,6.1s-1.3,3.9-2.1,5.5c-1.8-.7-3.8-1.4-5.9-2-2.2-.6-4.5-.8-6.8-.8-2.5,0-4.5.4-5.9,1.2s-2.1,2-2.1,3.8c0,1.6.5,2.8,1.5,3.5s2.4,1.3,4.3,1.9l6.4,1.9c2.1.6,4,1.3,5.7,2.2s3.1,1.9,4.3,3.2,2.1,2.8,2.8,4.7,1,4.2,1,6.8c0,2.8-.6,5.3-1.7,7.7-1.2,2.4-2.8,4.5-5,6.2-2.2,1.8-4.9,3.1-8,4.2-3.1,1-6.7,1.5-10.7,1.5-1.8,0-3.4-.1-4.9-.2-1.5-.1-2.9-.3-4.3-.6s-2.7-.6-4.1-1c-1.3-.4-2.8-.9-4.4-1.5.1-2,.5-4.1,1.1-6.1.6-2.1,1.3-4.1,2.2-6,2.5,1,4.8,1.7,7,2.2s4.5.7,6.9.7c1,0,2.2-.1,3.4-.3s2.4-.5,3.4-1,1.9-1.1,2.6-1.9c.7-.8,1.1-1.8,1.1-3.1,0-1.8-.5-3.1-1.6-3.9-1.1-.8-2.6-1.5-4.5-2.1l-7.3-1.9Zm39.3-32.7c2.7-.4,5.3-.7,8-.7s5.3.2,8,.7v30.7c0,3.1.2,5.6.7,7.6s1.2,3.6,2.2,4.7c1,1.2,2.3,2,3.8,2.5s3.3.7,5.3.7c2.8,0,5.1-.3,7-.8v-45.4c2.7-.4,5.3-.7,7.9-.7s5.3.2,8,.7v55.8c-2.4.8-5.6,1.6-9.5,2.4-3.9.8-8,1.2-12.3,1.2-3.8,0-7.5-.3-11-.9-3.5-.6-6.6-1.9-9.3-3.8-2.7-1.9-4.8-4.8-6.3-8.5-1.6-3.7-2.4-8.7-2.4-14.9v-31.3h-.1Zm65.9,58c-.4-2.8-.7-5.5-.7-8.2s.2-5.5.7-8.3c2.8-.4,5.5-.7,8.2-.7s5.5.2,8.3.7c.4,2.8.7,5.6.7,8.2,0,2.8-.2,5.5-.7,8.3-2.8.4-5.6.7-8.2.7-2.8-.1-5.5-.3-8.3-.7Zm-.4-80.7c2.9-.4,5.8-.7,8.6-.7s5.8.2,8.8.7l-1.1,54.9c-2.6.4-5.1.7-7.5.7s-5.1-.2-7.6-.7l-1.2-54.9Z" />
                  <path id="Rim" d="m150,0C67.2,0,0,67.2,0,150s67.2,150,150,150,150-67.2,150-150S232.8,0,150,0Zm0,285c-74.6,0-135-60.4-135-135S75.4,15,150,15s135,60.4,135,135-60.4,135-135,135Z" />
                </svg>
                <p>Login with osu!</p>
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
