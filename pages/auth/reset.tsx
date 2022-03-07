// React Module Imports
import { useState } from 'react'

// Next Module Imports
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { setCookies } from 'cookies-next';

// Prime React Imports
import { Password } from 'primereact/password';

// 3rd Party Imports
import * as yup from 'yup';
import { ErrorMessage, Formik, Field, FormikHelpers } from 'formik';
import { ToastContainer } from "react-toastify";

// Style and Component Imports
import Logo from '../../public/images/logo-black.png'
import styles from '../../styles/Auth.module.scss'
import Layout from '../../components/layout'
import { withAuthSync } from '../../utils/auth'

// Interface/Helper Imports
import service from '../../helper/api/api';

interface Values {
  password: string;
  confirmpassword: string;
}

const Login: NextPage = () => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');
  const [authSpinner, setAuthSpinner] = useState(false);

  const validationSchema = yup.object().shape({
    password: yup.string().required('Please enter password').min(8, 'Password is too short - should be 8 chars minimum').matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
      "Password must have uppercase, lowercase, number and special case character"
    ),
    confirmpassword: yup.string().required('Please enter confirm password').oneOf([yup.ref('password'), null], 'Passwords must match')
  });

  // LoginSubmitHandler
  const ResetSubmitHandler = async (userData: any) => {
    try {
      setAuthSpinner(true)

      const { data } = await service({
        url: `${process.env.API_BASE_URL}/confirm_email`,
        method: 'POST',
        data: userData,
        headers: { 'Content-Type': 'application/json' }
      });
      if (data.status != 200) {
        setErrorMessage(data.message)
        return setAuthSpinner(false)
      }
      let setUser = Date.now() + JSON.parse(userData).email;
      window.localStorage.setItem('loginUserdata', JSON.stringify(data.data[0].user));
      window.localStorage.setItem('authToken', JSON.stringify(data.data[0].token));
      await window.localStorage.setItem('ValidUser', setUser);
      await setCookies('ValidUser', setUser);
      setErrorMessage('')
      setAuthSpinner(false)
      router.push('/');

    } catch (err: any) {
      setErrorMessage(err.message)
      setAuthSpinner(false);
    }
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
            width={198}
            height={48}
          />
        </div>
        <div className={styles.authForm}>
          <Formik
            initialValues={{
              password: '',
              confirmpassword: ''
            }}
            validationSchema={validationSchema}
            onSubmit={(
              values: Values,
              { setSubmitting }: FormikHelpers<Values>
            ) => {
              ResetSubmitHandler(values);
              setSubmitting(false);
            }}
          >
            {props => (
              <form onSubmit={props.handleSubmit}>
                {
                  authSpinner ? <div className={styles.formSpinner}>
                    <div className={styles.loading}></div>
                  </div> : null
                }
                <div className={styles.titleBox}>
                  <h3>Reset Password</h3>
                </div>

                <div className={styles.inputBox}>
                  <label htmlFor="password">
                    Password
                  </label>
                  <Field name="password">
                    {({ field }: any) => (
                      <Password {...field} toggleMask feedback={false} />
                    )}
                  </Field>
                  <ErrorMessage name="password">
                    {(msg) => <p className={styles.error}>{msg}</p>}
                  </ErrorMessage>

                </div>
                <div className={styles.inputBox}>
                  <label htmlFor="password">
                    Confirm Password
                  </label>
                  <Field name="confirmpassword">
                    {({ field }: any) => (
                      <Password {...field} toggleMask feedback={false} />
                    )}
                  </Field>
                  <ErrorMessage name="confirmpassword">
                    {(msg) => <p className={styles.error}>{msg}</p>}
                  </ErrorMessage>

                </div>
                {
                  errorMessage ? <p className={styles.formError + " p-mt-0"}>{errorMessage}</p> : null
                }
                <button type="submit">Reset</button>
              </form>
            )}
          </Formik>
        </div>
      </div>
    </Layout>
  )
}

export default withAuthSync(Login)
