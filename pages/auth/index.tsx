import { useState } from 'react'
import type { NextPage } from 'next'
import Link from 'next/link'
import { ToastContainer } from "react-toastify";
import { setCookies } from 'cookies-next';
import { Formik, Field, Form, FormikHelpers } from 'formik';
import styles from '../../styles/Auth.module.scss'
import Router from 'next/router'
import Layout from '../../components/layout'
import Image from 'next/image'
import Logo from '../../public/images/Logo_auth.svg'
import { withAuthSync } from '../../utils/auth'

import toast from "../../components/Toast";

interface Values {
  email: string;
  password: string;
}

const Login: NextPage = () => {
  const [submitDisable, setSubmitDisable] = useState(true);
  const [errorMessage, setErrorMessage] = useState(false);

  const handleSubmit = async (userData: any) => {
    try {
      setSubmitDisable(true)
      // console.log(userData);

      fetch(`${process.env.API_BASE_URL}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: userData,
      })
        .then(res => res.json())
        .then(async res => {
          // console.log(res);
          
          if (res.status != 200) {
            setErrorMessage(res.message)
            await toast({ type: "error", message: res.message });
            return false
          }
          let setUser = Date.now()+JSON.parse(userData).email;
          // console.log(setUser);
          window.localStorage.setItem('loginUserdata', JSON.stringify(res.data[0].user));
          window.localStorage.setItem('authToken', JSON.stringify(res.data[0].token));
          await window.localStorage.setItem('ValidUser', setUser);
          await setCookies('ValidUser', setUser);
          setErrorMessage(false)
          Router.push('/');
        })

      setSubmitDisable(false)

    } catch (error: any) {
      console.error(error)
      setSubmitDisable(false);
    }
  }

  const validateEmail = (value: string) => {
    setSubmitDisable(false);
    setErrorMessage(false);
    let error;
    if (!value) {
      error = 'Required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
      error = 'Invalid email address';
    }
    return error;
  }
  
  const validatePassword = (value: string) => {
    setSubmitDisable(false);
    setErrorMessage(false);
    let error;
    if (!value) {
      error = 'Required';
    } else if (value.length < 8) {
      error = 'Invalid Password';
    }
    return error;
  }

  return (
    <Layout header={false}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className={styles.authContainer}>
        <div className={styles.logo}>
          <Image
            src={Logo}
            alt="Octoplus"
            layout="fill"
          />
        </div>
        <div className={styles.authForm}>
          <Formik
            initialValues={{
              email: '',
              password: ''
            }}
            onSubmit={(
              values: Values,
              { setSubmitting }: FormikHelpers<Values>
            ) => {
              handleSubmit(JSON.stringify(values, null, 2));
              setSubmitting(false);
            }}
          >
            {props => (
              <form onSubmit={props.handleSubmit}>

                <div className={styles.titleBox}>
                  <h3>Sign In to Octoplus</h3>
                  <p>
                    New Here?
                    <Link href="/auth/signup">
                      <a> Create an Account</a>
                    </Link>
                  </p>
                </div>
                <div className={styles.inputBox}>
                  <label htmlFor="email">Email</label>
                  <Field name="email" validate={validateEmail}>
                    {({ field }: any) => (
                      <input type="text" {...field}
                        className={props.values.email ? (props.errors.email ? styles.red : styles.blue) : ''}
                        id="email" autoFocus />
                    )}
                  </Field>
                </div>

                <div className={styles.inputBox}>
                  <label htmlFor="password">
                    Password
                    <Link href="/auth/forgotpassword">
                      <a>Forgot Password ?</a>
                    </Link></label>
                  <Field name="password" validate={validatePassword}>
                    {({ field }: any) => (
                      <input type="password" {...field}
                        className={props.values.password ? (props.errors.password ? styles.red : styles.blue) : ''}
                        id="password"
                      />
                    )}
                  </Field>
                </div>
                {
                  errorMessage ? <p className={styles.formError}>{errorMessage}</p> : null
                }
                <button type="submit" disabled={submitDisable}>Login</button>
              </form>
            )}
          </Formik>
        </div>
      </div>
    </Layout>
  )
}

export default withAuthSync(Login)
