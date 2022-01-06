// React Module Imports
import { useEffect, useState, useRef } from 'react';

// Next Module Imports
import type { NextPage } from 'next'
import { useRouter } from 'next/router';
import { removeCookies } from 'cookies-next';

// Prime React Imports
import { Password } from 'primereact/password';
import { confirmDialog } from 'primereact/confirmdialog';

// 3rd Party Imports
import * as yup from 'yup';
import { ErrorMessage, Formik, Field, FormikHelpers } from 'formik';
import { ToastContainer } from "react-toastify";
import toast from "../../components/Toast";
import { withProtectSync } from "../../utils/protect"
import DashboardLayout from '../../components/DashboardLayout';

// Style and Component Imports
import layoutStyles from '../../styles/Home.module.scss';
import styles from '../../styles/profile.module.scss';

// Interface/Helper Imports
import service from '../../helper/api/api';

interface Values {
  currentpass: string,
  password: string,
  confirmpass: string
}

const Login: NextPage = () => {
  const router = useRouter();
  const [formSpinner, setFormSpinner] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  const [loginUserData, setLoginUserData] = useState({ email: '', _id: 0, IS_BLOCKED: '' });

  useEffect(() => {
    let userData = JSON.parse(`${window.localStorage.getItem('loginUserdata')}`);
    if (userData) {
      setLoginUserData(userData);
    }
  }, [])

  const validationSchema = yup.object().shape({
    currentpass: yup.string().required('Please enter current password').min(8, 'Password is too short - should be 8 chars minimum'),
    password: yup.string().required('Please enter password').notOneOf([yup.ref('currentpass'), null], 'New password cannot be same as current password').min(8, 'Password is too short - should be 8 chars minimum'),
    confirmpass: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match')
  });

  const updatePasswordSaveHandler = async (userData: any) => {
    try {
      let parseData = JSON.parse(userData)
      let updatePassData = { "current_password": `${parseData.currentpass}`, "password": `${parseData.password}` }

      let authToken = await window.localStorage.getItem('authToken');

      if (!authToken) {
        window.localStorage.removeItem("authToken")
        window.localStorage.removeItem("ValidUser")
        window.localStorage.removeItem('loginUserdata');
        return router.push('/auth');
      }
      setFormSpinner(true);
      const { data } = await service({
        url: `${process.env.API_BASE_URL}/password_update`,
        method: 'POST',
        data: JSON.stringify(updatePassData),
        headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) }
      });
      setFormSpinner(false);

      if (data.status != 200) {
        return await toast({ type: "error", message: data.message });
      }
      await toast({ type: "success", message: "Password Changed Successful" });
      removeCookies("ValidUser")
      window.localStorage.removeItem("authToken")
      window.localStorage.removeItem("ValidUser")
      window.localStorage.removeItem('loginUserdata');
      
      return router.push('/auth');

    } catch (err) {
      setFormSpinner(false);
      return await toast({ type: "error", message: err });
    }
  }

  const updatePasswordConfirm = (userData: any) => {
    confirmDialog({
      message: 'You will be logged out automatically after the password is reset',
      header: 'Reset Password',
      icon: 'pi pi-info-circle',
      acceptClassName: layoutStyles.customRedBgbtn,
      accept: () => updatePasswordSaveHandler(userData)
    });
  }

  const deleteAccountHandler = async () => {
    try {
      let updatePassData = { "_id": loginUserData._id, "IS_BLOCKED": 'Y' }
      let authToken = await window.localStorage.getItem('authToken');

      if (!authToken) {
        window.localStorage.removeItem("authToken")
        window.localStorage.removeItem("ValidUser")
        window.localStorage.removeItem('loginUserdata');
        return router.push('/auth');
      }

      const { data } = await service({
        url: `${process.env.API_BASE_URL}/profile_delete`,
        method: 'POST',
        data: JSON.stringify(updatePassData),
        headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) }
      });

      if (data.status != 200) {
        await toast({ type: "error", message: data.message });
        return false
      }
      await toast({ type: "success", message: "Account Delete Successfull" });
      removeCookies("ValidUser")
      window.localStorage.removeItem("authToken")
      window.localStorage.removeItem("ValidUser")
      window.localStorage.removeItem('loginUserdata');
      return router.push('/auth');
    } catch (err) {
      toast({ type: "error", message: err });
    }
  }

  const deleteConfirm = () => {
    confirmDialog({
      message: 'Are you sure you want to delete the account ?',
      header: 'Delete Account',
      icon: 'pi pi-info-circle',
      acceptClassName: layoutStyles.customRedBgbtn,
      accept: deleteAccountHandler
    });
  }


  return (
    <DashboardLayout sidebar={true}>
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
      <div className={layoutStyles.topBar}>
        <p>Home / Proflie / <span>Login</span></p>
        <h5>Login {`&`} Security</h5>
      </div>
      <div className={layoutStyles.box}>
        <div className={layoutStyles.headContentBox + " p-mb-5"}>
          <div className={layoutStyles.head}>
            <h4>Login Credentials</h4>
          </div>
          <div className={layoutStyles.textBox}>
            {!editProfile ?
              <div className={styles.profileForm}>
                <div className={styles.inputBox + " w-100"}>
                  <label>Email Address</label>
                  <p>{loginUserData.email}</p>
                </div>
                <div className="p-d-flex w-100 p-ai-center p-jc-between">
                  <div className={styles.inputBox}>
                    <label>Password</label>
                    <p>&bull; &bull; &bull; &bull; &bull; &bull; &bull;</p>
                  </div>
                  <button onClick={() => setEditProfile(true)} className={layoutStyles.customBluebtn}>Reset Password</button>
                </div>
              </div>
              :
              <Formik
                enableReinitialize
                initialValues={{
                  currentpass: '',
                  password: '',
                  confirmpass: ''
                }}
                validationSchema={validationSchema}
                onSubmit={(
                  values: Values,
                  { setSubmitting }: FormikHelpers<Values>
                ) => {
                  updatePasswordConfirm(JSON.stringify(values, null, 2));
                  setSubmitting(false);
                }}
              >
                {props => (
                  <form onSubmit={props.handleSubmit}>
                    {
                      formSpinner ? <div className={styles.formSpinner}>
                        <div className={styles.loading}></div>
                      </div> : null
                    }
                    <>
                      <div className={styles.passUpdateForm}>
                        <div className={styles.inputBox}>
                          <label htmlFor="currentpass">Current Password</label>
                          <Field type="password" name="currentpass">
                            {({ field }: any) => (
                              <Password {...field} toggleMask feedback={false} />
                            )}
                          </Field>
                          <ErrorMessage name="currentpass">
                            {(msg) => <p className={styles.error}>{msg}</p>}
                          </ErrorMessage>
                        </div>
                        <div className={styles.inputBox}>
                          <label htmlFor="password">New Password</label>
                          <Field type="password" name="password">
                            {({ field }: any) => (
                              <Password {...field} toggleMask feedback={false} />
                            )}
                          </Field>
                          <ErrorMessage name="password">
                            {(msg) => <p className={styles.error}>{msg}</p>}
                          </ErrorMessage>
                        </div>
                        <div className={styles.inputBox}>
                          <label htmlFor="confirmpass">Confirm New Password</label>
                          <Field type="password" name="confirmpass">
                            {({ field }: any) => (
                              <Password {...field} toggleMask feedback={false} />
                            )}
                          </Field>
                          <ErrorMessage name="confirmpass">
                            {(msg) => <p className={styles.error}>{msg}</p>}
                          </ErrorMessage>
                        </div>
                      </div>
                      <div>
                        <button type='submit' className={layoutStyles.customBlueBgbtn + " p-mr-1 p-ml-0"}>Update Password</button>
                        <button type='button' onClick={() => setEditProfile(false)} className={layoutStyles.customBluebtn}>Cancel</button>
                      </div>
                    </>
                  </form>
                )}
              </Formik>
            }
          </div>
        </div>
        <div className={layoutStyles.headContentBox}>
          <div className={layoutStyles.head}>
            <h4>Delete Account</h4>
          </div>
          <div className={layoutStyles.textBox}>
            <div className={styles.deleteAccForm}>
              <p>By deleting your account, you'll no longer be able to access any of your data or log in to Octoplus.</p>
              <button onClick={deleteConfirm} className={styles.deleteBtn}>Delete Account</button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default withProtectSync(Login)