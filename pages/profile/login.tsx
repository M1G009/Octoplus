import type { NextPage } from 'next'
import { useEffect, useState, useRef } from 'react';
import Router from 'next/router';
import { InputText } from 'primereact/inputtext';
import Modal from 'react-modal';
import { removeCookies } from 'cookies-next';
import { ToastContainer } from "react-toastify";

import toast from "../../components/Toast";
import { withProtectSync } from "../../utils/protect"
import DashboardLayout from '../../components/DashboardLayout';

import layoutStyles from '../../styles/Home.module.scss';
import styles from '../../styles/profile.module.scss';

const Login: NextPage = () => {
  const [editProfile, setEditProfile] = useState(false);
  const [loginUserData, setLoginUserData] = useState({ email: '', _id: 0, IS_BLOCKED: '' });
  const [deleteModal, setDeleteModal] = useState(false);
  const [passFields, setPassFields] = useState({
    currentpass: { error: '', value: '' },
    password: { error: '', value: '' },
    confirmpass: { error: '', value: '' },
  })
  const [updatePassBtn, setUpdatePassBtn] = useState(false);

  useEffect(() => {
    let userData = JSON.parse(`${window.localStorage.getItem('loginUserdata')}`);
    if (userData) {
      setLoginUserData(userData);
    }
  }, [])

  const updatePasswordHandler = (key: any, value: any) => {
    let error = '';
    if (value.length < 8 && key != 'confirmpass') {
      error = 'Please Enter Valid Password'
    } else if (key == 'confirmpass') {
      if (passFields.password.value != value) {
        error = 'Please enter valid confirm password'
      }
    }
    setPassFields((prevState) => ({ ...prevState, [key]: { error, value } }));
  }

  const updatePasswordSaveHandler = async () => {
    try {
      if (!passFields.currentpass.error && !passFields.password.error && !passFields.confirmpass.error) {

        let updatePassData = { "current_password": `${passFields.currentpass.value}`, "password": `${passFields.password.value}` }
        console.log(updatePassData);

        let authToken = await window.localStorage.getItem('authToken');

        if (!authToken) {
          window.localStorage.removeItem("authToken")
          window.localStorage.removeItem("ValidUser")
          window.localStorage.removeItem('loginUserdata');
          return Router.push('/auth');
        }

        setUpdatePassBtn(true);
        fetch(`${process.env.API_BASE_URL}/password_update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) },
          body: JSON.stringify(updatePassData),
        })
          .then(res => res.json())
          .then(async res => {
            if (res.status != 200) {
              return await toast({ type: "error", message: res.message });
            }
            toast({ type: "success", message: "Password Changed Successful" });
            setUpdatePassBtn(false);
            setEditProfile(false);
          }).catch(err => {
            toast({ type: "error", message: err });
            setUpdatePassBtn(false);
          })
      }
    } catch (err) {

    }
  }

  const addNewFieldModalCustomStyles = {
    overlay: {
      background: "#00000021",
      backdropFilter: "blur(7px)"
    },
    content: {
      "border": "1px solid rgb(204, 204, 204)",
      "background": "rgb(255, 255, 255)",
      "overflow": "auto",
      "borderRadius": "4px",
      "outline": "none",
      "width": "550px",
      "padding": "0px",
      "maxWidth": "100%",
      "top": "50%",
      "left": "50%",
      "bottom": "auto",
      "right": "auto",
      "transform": "translate(-50%, -50%)"
    }
  };

  const deleteAccountHandler = async () => {
    let updatePassData = { "_id": loginUserData._id, "IS_BLOCKED": 'Y' }
    // console.log(JSON.stringify(updatePassData));

    let authToken = await window.localStorage.getItem('authToken');

    if (!authToken) {
      window.localStorage.removeItem("authToken")
      window.localStorage.removeItem("ValidUser")
      window.localStorage.removeItem('loginUserdata');
      return Router.push('/auth');
    }

    fetch(`${process.env.API_BASE_URL}/profile_delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) },
      body: JSON.stringify(updatePassData),
    })
      .then(res => res.json())
      .then(async res => {
        console.log(res);
        if (res.status != 200) {
          await toast({ type: "error", message: res.message });
          return setDeleteModal(false)
        }
        await toast({ type: "success", message: "Account Delete Successfull" });
        removeCookies("ValidUser")
        window.localStorage.removeItem("authToken")
        window.localStorage.removeItem("ValidUser")
        window.localStorage.removeItem('loginUserdata');
        setDeleteModal(false)
        Router.push('/auth');
      }).catch(err => {
        toast({ type: "error", message: err });
        setDeleteModal(false)
      })
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
              <>
                <div className={styles.passUpdateForm}>
                  <div className={styles.inputBox}>
                    <label htmlFor="currentpass">Current Password</label>
                    <InputText className={passFields.currentpass.error ? styles.errorField : ''} id="currentpass" name="currentpass" type="password" value={passFields.currentpass.value} onChange={(e) => updatePasswordHandler(e.target.name, e.target.value)} />
                    {
                      // passFields.currentpass.error ? <p className={styles.errorMsg}>{passFields.currentpass.error}</p> : null
                    }
                  </div>
                  <div className={styles.inputBox}>
                    <label htmlFor="password">New Password</label>
                    <InputText className={passFields.password.error ? styles.errorField : ''} id="password" name="password" type="password" value={passFields.password.value} onChange={(e) => updatePasswordHandler(e.target.name, e.target.value)} />
                    {
                      // passFields.password.error ? <p className={styles.errorMsg}>{passFields.password.error}</p> : null
                    }
                  </div>
                  <div className={styles.inputBox}>
                    <label htmlFor="confirmpass">Confirm New Password</label>
                    <InputText className={passFields.confirmpass.error ? styles.errorField : ''} id="confirmpass" name="confirmpass" type="password" value={passFields.confirmpass.value} onChange={(e) => updatePasswordHandler(e.target.name, e.target.value)} />
                    {
                      // passFields.confirmpass.error ? <p className={styles.errorMsg}>{passFields.confirmpass.error}</p> : null
                    }
                  </div>
                </div>
                <div>
                  <button disabled={updatePassBtn} onClick={updatePasswordSaveHandler} className={layoutStyles.customBlueBgbtn + " p-mr-1 p-ml-0"}>Update Password</button>
                  <button onClick={() => setEditProfile(false)} className={layoutStyles.customBluebtn}>Cancel</button>
                </div>
              </>
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
              <button onClick={() => setDeleteModal(true)} className={styles.deleteBtn}>Delete Account</button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account-Modal */}
      <Modal
        isOpen={deleteModal}
        style={addNewFieldModalCustomStyles}
        contentLabel="Add New Field Modal"
        ariaHideApp={false}
      >
        <div className={styles.deleteAccountModal}>
          <h5>Are you sure you want to delete the account ?</h5>
          <div className="p-d-flex p-ai-center p-mt-3">
            <div className="p-m-auto">
              <button onClick={() => setDeleteModal(false)} className={layoutStyles.customBluebtn}>Cancel</button>
              <button onClick={deleteAccountHandler} className={layoutStyles.customBlueBgbtn}>Delete</button>
            </div>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}

export default withProtectSync(Login)