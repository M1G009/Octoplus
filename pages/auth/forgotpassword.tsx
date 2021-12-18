import { useState } from 'react'
import type { NextPage } from 'next'
import { Formik, Field, Form, FormikHelpers } from 'formik';
import Image from 'next/image'
import { ToastContainer } from "react-toastify";
import toast from "../../components/Toast";
import styles from '../../styles/Auth.module.scss'
import Router from 'next/router'
import Layout from '../../components/layout'
import Logo from '../../public/images/logo_auth.svg'
import { setCookies } from 'cookies-next'
import { withAuthSync } from '../../utils/auth'

interface Values {
  email: string;
}

const ForgotPassword: NextPage = () => {
  const [submitDisable, setSubmitDisable] = useState(true);
  const [errorMessage, setErrorMessage] = useState(false);
  const [sendMessage, setSendMessage] = useState(false);
  const [userData, setUserData] = useState({
    email: '',
  })

  function validateEmail(value: string) {
    setSubmitDisable(false);
    setErrorMessage(false);
    let error;
    if (!value) {
      setSubmitDisable(true);
      error = 'Required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
      error = 'Invalid email address';
    }
    return error;
  }

  const handleSubmit = async (userData: any) => {
    try {
      setSubmitDisable(true)
      // console.log(userData);

      fetch(`${process.env.API_BASE_URL}/sendmail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: userData,
      })
        .then(res => res.json())
        .then(async res => {
          if (res.status != 200) {
            setErrorMessage(res.message)
            await toast({ type: "error", message: res.message });
            return false;
          }
          setSendMessage(true)
          await toast({ type: "success", message: "Please check your mail" });
          setTimeout(() => {
            setSendMessage(false)
          }, 3000);
        })

      setSubmitDisable(false)

    } catch (error: any) {
      console.error(error)
      setSubmitDisable(false);
    }
  }

  const routerPushHandler = (url: string) => {
    return Router.push(url)
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
              email: ''
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
                  <h3>Forgot Password ?</h3>
                  <p>
                    Enter your email to reset your password.
                  </p>
                </div>
                <div className={styles.inputBox}>
                  <label htmlFor="email">Email</label>
                  <Field name="email" validate={validateEmail}>
                    {({ field }: any) => (
                      <input type="text" {...field}
                        className={props.values.email ? (props.errors.email ? styles.red : styles.blue) : ''}
                        id="email"
                      />
                    )}
                  </Field>
                </div>
                {
                  sendMessage ? <p className={styles.formMessage}>Please check your email</p> : null
                }
                {
                  errorMessage ? <p className={styles.formError}>{errorMessage}</p> : null
                }
                <div className={styles.btnGroup}>
                  <button type="submit" disabled={submitDisable}>Submit</button>
                  <button type="button" className={styles.cancelBtn} onClick={() => routerPushHandler('/auth')}>Cancel</button>
                </div>
              </form>
            )}
          </Formik>
        </div>
      </div>
    </Layout>
  )
}

export default withAuthSync(ForgotPassword)
