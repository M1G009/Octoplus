// React Module Imports
import { useState } from 'react'

// Next Module Imports
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import Image from 'next/image'

// Prime React Imports

// 3rd Party Imports
import * as yup from 'yup';
import { ErrorMessage, Formik, Field, FormikHelpers } from 'formik';
import { ToastContainer } from "react-toastify";

// Style and Component Imports
import toast from "../../components/Toast";
import styles from '../../styles/Auth.module.scss'
import Layout from '../../components/layout'
import Logo from '../../public/images/logo_authentication.svg'
import { withAuthSync } from '../../utils/auth'

// Interface/Helper Imports
import service from '../../helper/api/api';


interface Values {
  email: string;
}

const ForgotPassword: NextPage = () => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState(false);
  const [authSpinner, setAuthSpinner] = useState(false);

  const validationSchema = yup.object().shape({
    email: yup.string().required('Please enter email').email("Please enter valid email"),
  });

  const handleSubmit = async (userData: any) => {
    try {
      setAuthSpinner(true)

      const { data } = await service({
        url: `${process.env.API_BASE_URL}/user/login`,
        method: 'POST',
        data: userData,
        headers: { 'Content-Type': 'application/json' }
      });

      if (data.status != 200) {
        setErrorMessage(data.message)
        return setAuthSpinner(false)
      }
      setAuthSpinner(false)
      await toast({ type: "success", message: "Please check your mail" });

    } catch (err: any) {
      setErrorMessage(err.message)
      setAuthSpinner(false);
    }
  }

  const routerPushHandler = (url: string) => {
    return router.push(url)
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
              email: ''
            }}
            validationSchema={validationSchema}
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
                {
                  authSpinner ? <div className={styles.formSpinner}>
                    <div className={styles.loading}></div>
                  </div> : null
                }
                <div className={styles.titleBox}>
                  <h3>Forgot Password ?</h3>
                  <p>
                    Enter your email to reset your password.
                  </p>
                </div>
                <div className={styles.inputBox}>
                  <label htmlFor="email">Email</label>
                  <Field type="email" name="email" />
                  <ErrorMessage name="email">
                    {(msg) => <p className={styles.error}>{msg}</p>}
                  </ErrorMessage>
                </div>
                {
                  errorMessage ? <p className={styles.formError + " p-mt-0"}>{errorMessage}</p> : null
                }
                <div className={styles.btnGroup}>
                  <button type="submit">Submit</button>
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
