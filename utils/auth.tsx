import { useEffect, useState } from 'react'
import Router from 'next/router'
import { getCookie } from 'cookies-next'


export const withAuthSync = (Component: any) => {

  const Wrapper = (props: any) => {
    const [validUser, setValidUser] = useState(false);
    useEffect(() => {
      let validuserCookie = getCookie('ValidUser');
      let validuserLocal = window.localStorage.getItem('ValidUser');
      if (!!validuserCookie && !!validuserLocal && validuserCookie === validuserLocal) {
        Router.push('/');
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