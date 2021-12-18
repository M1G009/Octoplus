import React, { useState, useRef, useEffect } from 'react';
import Router from 'next/router';
import type { NextPage } from 'next'
import Image from 'next/image'
import { FaCamera } from "react-icons/fa";
import { InputTextarea } from 'primereact/inputtextarea';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { ToastContainer } from "react-toastify";
import toast from "../../components/Toast";

import { withProtectSync } from "../../utils/protect"
import DashboardLayout from '../../components/DashboardLayout';
import User from '../../public/images/user.png'

import layoutStyles from '../../styles/Home.module.scss';
import styles from '../../styles/profile.module.scss';
import "react-toastify/dist/ReactToastify.css";

export interface Access {
  create: string;
  read: string;
  update: string;
  delete: string;
}

export interface Scope {
  name: string;
  slug: string;
  access: Access;
}

export interface Role {
  name: string;
  scopes: Scope[];
}

export interface ILoginUserData {
  _id: string;
  username: string;
  email: string;
  country: string;
  profile_photo: string;
  IS_BLOCKED: string;
  phone_number: string;
  Company: string;
  Language: string;
  INVITE_ASSIGN: number;
  created_date: string;
  role: Role;
  modified_date: string;
}

export interface updatedData {
  username: {
    error: boolean;
    value: string;
  };
  Company: {
    error: boolean;
    value: string;
  };
  email: string;
  country: {
    error: boolean;
    value: string;
  };
  phone_number: {
    error: boolean;
    value: string;
  };
  Language: {
    error: boolean;
    value: string;
  };
}

export interface IupdatedObject {
  username: string;
  Company: string;
  email: string;
  country: string;
  phone_number: string;
  Language: string;
}

const Account: NextPage = () => {
  const imageFileRef = useRef<HTMLInputElement>(null);
  const [editProfile, setEditProfile] = useState(false);
  const [loginUserData, setLoginUserData] = useState<ILoginUserData>();
  const [editProfileFields, setEditProfileFields] = useState<updatedData>({
    username: { error: false, value: '' },
    Company: { error: false, value: '' },
    email: '',
    country: { error: false, value: '' },
    phone_number: { error: false, value: '' },
    Language: { error: false, value: 'Hindi' },
  })
  const [saveChangeBox, setSaveChangesBox] = useState(false);

  useEffect(() => {
    let userData = window.localStorage.getItem('loginUserdata');
    if (userData) {
      let parseData = JSON.parse(userData);
      // console.log(parseData);
      setLoginUserData(parseData);
      setEditProfileFields({
        username: { error: false, value: parseData.username },
        Company: { error: false, value: parseData.Company },
        email: parseData.email,
        country: { error: false, value: parseData.country },
        phone_number: { error: false, value: parseData.phone_number },
        Language: { error: false, value: parseData.Language },
      })
    }
  }, [])

  const languages = [
    { name: 'Hindi' },
    { name: 'English' },
    { name: 'Gujarati' },
    { name: 'Spanish' },
    { name: 'Russian' }
  ];

  const imageFileBtnHandler = () => {
    if (imageFileRef.current) {
      imageFileRef.current.click();
    }
  }

  const imageFileChangeHandler = (e: any) => {
    e.preventDefault();

    let reader = new FileReader();
    let file = e.target.files[0];

    reader.onloadend = () => {
      console.log(file, reader.result);
    };
    reader.readAsDataURL(file);
  }

  const editProfileHandler = (key: any, value: any) => {
    let error = false;
    if (!value.length) {
      error = true
    }
    setEditProfileFields((prevState) => ({ ...prevState, [key]: { error, value } }));
  }

  const updateProfileHandler = async () => {
    try {
      if (!editProfileFields.username.value || !editProfileFields.Company.value || !editProfileFields.country.value || !editProfileFields.phone_number.value || !editProfileFields.Language.value) {
        return toast({ type: "error", message: "Please Enter Correct Value" });;
      }
      let updatedObject: IupdatedObject = {} as IupdatedObject;
      if (loginUserData) {
        if (!(loginUserData.username == editProfileFields.username.value)) {
          updatedObject['username'] = editProfileFields.username.value;
        }
        if (!(loginUserData.Company == editProfileFields.Company.value)) {
          updatedObject['Company'] = editProfileFields.Company.value;
        }
        if (!(loginUserData.country == editProfileFields.country.value)) {
          updatedObject['country'] = editProfileFields.country.value;
        }
        if (!(loginUserData.phone_number == editProfileFields.phone_number.value)) {
          updatedObject['phone_number'] = editProfileFields.phone_number.value;
        }
        if (!(loginUserData.Language == editProfileFields.Language.value)) {
          updatedObject['Language'] = editProfileFields.Language.value;
        }
      }

      let authToken = await window.localStorage.getItem('authToken');

      if (!authToken) {
        window.localStorage.removeItem("authToken")
        window.localStorage.removeItem("ValidUser")
        window.localStorage.removeItem('loginUserdata');
        return Router.push('/auth');
      }

      if (Object.keys(updatedObject).length) {
        setSaveChangesBox(true);
        fetch(`${process.env.API_BASE_URL}/profile_update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) },
          body: JSON.stringify(updatedObject),
        })
          .then(res => res.json())
          .then(async res => {
            if (res.status != 200) {
              await toast({ type: "error", message: res.message });
              setSaveChangesBox(false);
              return setEditProfile(false);
            }

            await toast({ type: "success", message: "Profile update successful" });
            if (loginUserData) {
              let newProfile = loginUserData;
              if (updatedObject['username']) {
                newProfile.username = updatedObject['username'];
              }
              if (updatedObject['Company']) {
                newProfile.Company = updatedObject['Company'];
              }
              if (updatedObject['country']) {
                newProfile.country = updatedObject['country'];
              }
              if (updatedObject['phone_number']) {
                newProfile.phone_number = updatedObject['phone_number'];
              }
              if (updatedObject['Language']) {
                newProfile.Language = updatedObject['Language'];
              }
              window.localStorage.setItem('loginUserdata', JSON.stringify(newProfile));
              setLoginUserData(newProfile);
            }
            setSaveChangesBox(false);
            return setEditProfile(false)
          })
      }
    } catch (err) {

    }
  }

  const discardHandler = () => {
    if (loginUserData) {
      let parseData = loginUserData;
      setEditProfileFields({
        username: { error: false, value: parseData.username },
        Company: { error: false, value: parseData.Company },
        email: parseData.email,
        country: { error: false, value: parseData.country },
        phone_number: { error: false, value: parseData.phone_number },
        Language: { error: false, value: parseData.Language },
      })
    }
    setEditProfile(false);
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
        <p>Home / Proflie / <span>Account</span></p>
        <h5>Account Overview</h5>
      </div>
      <div className={layoutStyles.box}>
        <div className={layoutStyles.contentBox}>
          <div className={styles.profilePic}>
            <div className={styles.imgBox}>
              <div className={styles.userImg}>
                <Image
                  src={User}
                  alt="User"
                  width={96}
                  height={96}
                />
              </div>
              <div className={styles.textBox}>
                <h5>Esther Howard</h5>
                <p>debra.holt@example.com</p>
              </div>
            </div>
            <input type="file" className="p-d-none"
              ref={imageFileRef}
              onChange={imageFileChangeHandler} />
            <button className={styles.userImgChange} onClick={imageFileBtnHandler}><FaCamera className="p-mr-1" /> Change Photo Profile</button>
          </div>
        </div>
        <div className={layoutStyles.headContentBox}>
          <div className={layoutStyles.head}>
            <h4>Profile Detail</h4>
            <div className={layoutStyles.editButtons}>
              {
                !editProfile ?
                  <button onClick={() => setEditProfile(true)} className={layoutStyles.blueBgBtn}>Edit Profle</button>
                  :
                  <>
                    <button onClick={discardHandler} className={layoutStyles.blueBtn}>Discard</button>
                    <button disabled={saveChangeBox} onClick={updateProfileHandler} className={layoutStyles.blueBgBtn}>Save Change</button>
                  </>
              }
            </div>
          </div>
          <div className={layoutStyles.textBox}>
            <div className={styles.profileForm}>
              <div className={styles.inputBox}>
                <label htmlFor="Name">Name</label>
                {
                  editProfile ?
                    <InputText className={editProfileFields.username.error ? styles.errorField : ''} id="Name" name="username" type="text" value={editProfileFields.username.value} onChange={(e) => editProfileHandler(e.target.name, e.target.value)} />
                    : <p>{loginUserData ? loginUserData.username : ''}</p>
                }
              </div>
              <div className={styles.inputBox}>
                <label htmlFor="Company">Company</label>
                {
                  editProfile ? <InputText className={editProfileFields.Company.error ? styles.errorField : ''} id="Company" name="Company" type="text" value={editProfileFields.Company.value} onChange={(e) => editProfileHandler(e.target.name, e.target.value)} /> :
                    <p>{loginUserData ? loginUserData.Company : ''}</p>
                }
              </div>
              <div className={styles.inputBox}>
                <label htmlFor="emailAdress">Email Address</label>
                {
                  editProfile ? <InputText readOnly id="emailAdress" name="email" type="text" value={editProfileFields.email} /> :
                    <p>{editProfileFields.email}</p>
                }
              </div>
              <div className={styles.inputBox}>
                <label htmlFor="Country">Country</label>
                {
                  editProfile ? <InputText className={editProfileFields.country.error ? styles.errorField : ''} id="Country" name="country" type="text" value={editProfileFields.country.value} onChange={(e) => editProfileHandler(e.target.name, e.target.value)} /> :
                    <p>{loginUserData ? loginUserData.country : ''}</p>
                }
              </div>
              <div className={styles.inputBox}>
                <label htmlFor="phone_number">Phone Number</label>
                {
                  editProfile ? <InputText className={editProfileFields.phone_number.error ? styles.errorField : ''} id="phone_number" name="phone_number" type="text" value={editProfileFields.phone_number.value} onChange={(e) => editProfileHandler(e.target.name, e.target.value)} /> :
                    <p>{loginUserData ? loginUserData.phone_number : ''}</p>
                }
              </div>
              <div className={styles.inputBox}>
                <label htmlFor="Language">Language</label>
                {
                  editProfile ?
                    <select className={editProfileFields.Language.error ? styles.errorField + ' ' + styles.selectBox : styles.selectBox} id="Language" name="Language" value={editProfileFields.Language.value} onChange={(e) => editProfileHandler(e.target.name, e.target.value)} >
                      {
                        languages.map(lan => <option key={"language" + lan.name} value={lan.name}>{lan.name}</option>)
                      }
                    </select>
                    :
                    <p>{loginUserData ? loginUserData.Language : ''}</p>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default withProtectSync(Account)