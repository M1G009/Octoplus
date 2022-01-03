import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getCookie } from 'cookies-next'


export const withAuthSync = (Component: any) => {

  const Wrapper = (props: any) => {
    const router = useRouter();
    const [validUser, setValidUser] = useState(false);
    useEffect(() => {
      let validuserCookie = getCookie('ValidUser');
      let validuserLocal = window.localStorage.getItem('ValidUser');
      if (!!validuserCookie && !!validuserLocal && validuserCookie === validuserLocal) {
        router.push('/');
      } else {
        setValidUser(true)
      }
    }, [])

    if (!validUser) {
      return false;
    }
    return <Component {...props} />
  }

  return Wrapper
}