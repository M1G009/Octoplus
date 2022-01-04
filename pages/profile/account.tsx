// React Module Imports
import React, { useState, useRef, useEffect } from 'react';

// Next Module Imports
import { useRouter } from 'next/router';
import type { NextPage } from 'next'
import Image from 'next/image'

// Prime React Imports
import { Dropdown } from 'primereact/dropdown';

// 3rd Party Imports
import * as yup from 'yup';
import { ErrorMessage, Formik, Field, FormikHelpers } from 'formik';
import { FaCamera } from "react-icons/fa";
import { ToastContainer } from "react-toastify";

// Style and Component Imports
import DashboardLayout from '../../components/DashboardLayout';
import { withProtectSync } from "../../utils/protect"
import toast from "../../components/Toast";
import User from '../../public/images/user.png'
import layoutStyles from '../../styles/Home.module.scss';
import styles from '../../styles/profile.module.scss';
import "react-toastify/dist/ReactToastify.css";

// Interface/Helper Imports
import service from '../../helper/api/api';


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
  username: string;
  Company: string;
  email: string;
  country: string;
  phone_number: string;
  Language: string;
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
  const router = useRouter();
  const [formSpinner, setFormSpinner] = useState(false);
  const imageFileRef = useRef<HTMLInputElement>(null);
  const [editProfile, setEditProfile] = useState(false);
  const [loginUserData, setLoginUserData] = useState<ILoginUserData>();

  useEffect(() => {
    let userData = window.localStorage.getItem('loginUserdata');
    if (userData) {
      let parseData = JSON.parse(userData);
      setLoginUserData(parseData);
    }
  }, [])

  const countriesData = ["Afghanistan", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", "Anguilla", "Antigua", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "British Indian Ocean Territory", "British Virgin Islands", "Brunei", "Bulgaria", "Burkina Faso", "Burma Myanmar", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Cayman Islands", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Cook Islands", "Costa Rica", "Côte d'Ivoire", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Democratic Republic of Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Falkland Islands", "Faroe Islands", "Federated States of Micronesia", "Fiji", "Finland", "France", "French Guiana", "French Polynesia", "Gabon", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macau", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Martinique", "Mauritania", "Mauritius", "Mayotte", "Mexico", "Moldova", "Monaco", "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Namibia", "Nauru", "Nepal", "Netherlands", "Netherlands Antilles", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue", "Norfolk Island", "North Korea", "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Puerto Rico", "Qatar", "Republic of the Congo", "Réunion", "Romania", "Russia", "Rwanda", "Saint Barthélemy", "Saint Helena", "Saint Kitts and Nevis", "Saint Martin", "Saint Pierre and Miquelon", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "São Tomé and Príncipe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "Spain", "Sri Lanka", "St. Lucia", "Sudan", "Suriname", "Swaziland", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "The Bahamas", "The Gambia", "Timor-Leste", "Togo", "Tokelau", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Turks and Caicos Islands", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "US Virgin Islands", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Wallis and Futuna", "Yemen", "Zambia", "Zimbabwe"]

  const languages = ["Abkhaz", "Afar", "Afrikaans", "Akan", "Albanian", "Amharic", "Arabic", "Aragonese", "Armenian", "Assamese", "Avaric", "Avestan", "Aymara", "Azerbaijani", "Bambara", "Bashkir", "Basque", "Belarusian", "Bengali", "Bihari", "Bislama", "Bosnian", "Breton", "Bulgarian", "Burmese", "Catalan", "Chamorro", "Chechen", "Chichewa", "Chinese", "Chuvash", "Cornish", "Corsican", "Cree", "Croatian", "Czech", "Danish", "Divehi", "Dutch", "English", "Esperanto", "Estonian", "Ewe", "Faroese", "Fijian", "Finnish", "French", "Fula", "Galician", "Georgian", "German", "Greek, Modern", "Guaraní", "Gujarati", "Haitian Creole", "Hausa", "Hebrew", "Hebrew", "Herero", "Hindi", "Hiri Motu", "Hungarian", "Interlingua", "Indonesian", "Interlingue", "Irish", "Igbo", "Inupiaq", "Ido", "Icelandic", "Italian", "Inuktitut", "Japanese", "Javanese", "Kalaallisut, Greenlandic", "Kannada", "Kanuri", "Kashmiri", "Kazakh", "Khmer", "Kikuyu, Gikuyu", "Kinyarwanda", "Kirghiz, Kyrgyz", "Komi", "Kongo", "Korean", "Kurdish", "Kwanyama, Kuanyama", "Latin", "Luxembourgish, Letzeburgesch", "Luganda", "Limburgish, Limburgan, Limburger", "Lingala", "Lao", "Lithuanian", "Luba-Katanga", "Latvian", "Manx", "Macedonian", "Malagasy", "Malay", "Malayalam", "Maltese", "Māori", "Marathi (Marāṭhī)", "Marshallese", "Mongolian", "Nauru", "Navajo, Navaho", "Norwegian Bokmål", "North Ndebele", "Nepali", "Ndonga", "Norwegian Nynorsk", "Norwegian", "Nuosu", "South Ndebele", "Occitan", "Ojibwe, Ojibwa", "Oromo", "Oriya", "Ossetian, Ossetic", "Panjabi", "Pāli", "Persian", "Polish", "Pashto, Pushto", "Portuguese", "Quechua", "Romansh", "Kirundi", "Romanian, Moldavian, Moldovan", "Russian", "Sanskrit (Saṁskṛta)", "Sardinian", "Sindhi", "Northern Sami", "Samoan", "Sango", "Serbian", "Scottish", "Shona", "Sinhala, Sinhalese", "Slovak", "Slovene", "Somali", "Southern Sotho", "Spanish", "Sundanese", "Swahili", "Swati", "Swedish", "Tamil", "Telugu", "Tajik", "Thai", "Tigrinya", "Tibetan Standard, Tibetan, Central", "Turkmen", "Tagalog", "Tswana", "Tonga (Tonga Islands)", "Turkish", "Tsonga", "Tatar", "Twi", "Tahitian", "Uighur, Uyghur", "Ukrainian", "Urdu", "Uzbek", "Venda", "Vietnamese", "Volapük", "Walloon", "Welsh", "Wolof", "Western Frisian", "Xhosa", "Yiddish", "Yoruba", "Zhuang, Chuang"]

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

  const validationSchema = yup.object().shape({
    username: yup.string().required('Please enter user name'),
    Company: yup.string().required('Please enter company'),
    email: yup.string().required('Please enter email').email("Please enter valid email"),
    country: yup.string().required('Please select country'),
    phone_number: yup.string().required('Please enter phone number'),
    Language: yup.string().required('Please select language')
  });

  // .matches(/^(\+\d{1,3}[- ]?)?\d{10}$/i , 'Please enter valid phone number')

  const updateProfileHandler = async (userData: any) => {
    try {
      let updateUser = JSON.parse(userData);
      delete updateUser.email
      for (const key in updateUser) {
        if (loginUserData && updateUser[key] == loginUserData[key as keyof updatedData]) {
          delete updateUser[key];
        }
      }

      let authToken = await window.localStorage.getItem('authToken');

      if (!authToken) {
        window.localStorage.removeItem("authToken")
        window.localStorage.removeItem("ValidUser")
        window.localStorage.removeItem('loginUserdata');
        return router.push('/auth');
      }

      if (Object.keys(updateUser).length) {
        setFormSpinner(true);
        const { data } = await service({
          url: `${process.env.API_BASE_URL}/profile_update`,
          method: 'POST',
          data: userData,
          headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) }
        });

        if (data.status != 200) {
          await toast({ type: "error", message: data.message });
          return setEditProfile(false);
        }

        await toast({ type: "success", message: "Profile update successful" });
        if (loginUserData) {
          let newProfile = loginUserData;
          for (const key in updateUser) {
            newProfile[key as keyof updatedData] = updateUser[key]
          }
          window.localStorage.setItem('loginUserdata', JSON.stringify(newProfile));
          setLoginUserData(newProfile);
        }
        setFormSpinner(false);
        return setEditProfile(false)

      }
    } catch (err) {
      await toast({ type: "error", message: err });
      return setFormSpinner(false);
    }
  }

  const discardHandler = () => {
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
                <h5>{loginUserData ? loginUserData.username : ''}</h5>
                <p>{loginUserData ? loginUserData.email : ''}</p>
              </div>
            </div>
            <input type="file" className="p-d-none"
              ref={imageFileRef}
              onChange={imageFileChangeHandler} />
            <button className={styles.userImgChange} onClick={imageFileBtnHandler}><FaCamera className="p-mr-1" /> Change Photo Profile</button>
          </div>
        </div>
        <div className={layoutStyles.headContentBox}>
          <Formik
            enableReinitialize
            initialValues={{
              username: loginUserData ? loginUserData.username : '',
              Company: loginUserData ? loginUserData.Company : '',
              email: loginUserData ? loginUserData.email : '',
              country: loginUserData ? loginUserData.country : 'Italy',
              phone_number: loginUserData ? loginUserData.phone_number : '',
              Language: loginUserData ? loginUserData.Language : 'English',
            }}
            validationSchema={validationSchema}
            onSubmit={(
              values: updatedData,
              { setSubmitting }: FormikHelpers<updatedData>
            ) => {
              updateProfileHandler(JSON.stringify(values, null, 2));
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
                <div className={layoutStyles.head}>
                  <h4>Profile Detail</h4>
                  <div className={layoutStyles.editButtons}>
                    {
                      !editProfile ?
                        <button type="button" onClick={() => setEditProfile(true)} className={layoutStyles.blueBgBtn}>Edit Profle</button>
                        :
                        <>
                          <button type="button" onClick={discardHandler} className={layoutStyles.blueBtn}>Discard</button>
                          <button type="submit" className={layoutStyles.blueBgBtn}>Save Change</button>
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
                          <div>
                            <Field type="text" name="username" />
                            <ErrorMessage name="username">
                              {(msg) => <p className={styles.error}>{msg}</p>}
                            </ErrorMessage>
                          </div>
                          : <p>{loginUserData ? loginUserData.username : ''}</p>
                      }
                    </div>
                    <div className={styles.inputBox}>
                      <label htmlFor="Company">Company</label>
                      {
                        editProfile ?
                          <div>
                            <Field type="text" name="Company" />
                            <ErrorMessage name="Company">
                              {(msg) => <p className={styles.error}>{msg}</p>}
                            </ErrorMessage>
                          </div>
                          :
                          <p>{loginUserData ? loginUserData.Company : ''}</p>
                      }
                    </div>
                    <div className={styles.inputBox}>
                      <label htmlFor="emailAdress">Email Address</label>
                      {
                        editProfile ?
                          <div>
                            <Field type="email" name="email" readOnly />
                            <ErrorMessage name="email">
                              {(msg) => <p className={styles.error}>{msg}</p>}
                            </ErrorMessage>
                          </div>
                          :
                          <p>{loginUserData ? loginUserData.email : ''}</p>
                      }
                    </div>
                    <div className={styles.inputBox}>
                      <label htmlFor="Country">Country</label>
                      {
                        editProfile ?
                          <div>
                            <Dropdown id="text" name="country" className={styles.dropDown} value={props.values.country} options={countriesData} onChange={(e: any) => props.setFieldValue('country', e.target.value)} />
                            <ErrorMessage name="country">
                              {(msg) => <p className={styles.error}>{msg}</p>}
                            </ErrorMessage>
                          </div>
                          :
                          <p>{loginUserData ? loginUserData.country : ''}</p>
                      }
                    </div>
                    <div className={styles.inputBox}>
                      <label htmlFor="phone_number">Phone Number</label>
                      {
                        editProfile ?
                          <div>
                            <Field type="phone_number" name="phone_number" />
                            <ErrorMessage name="phone_number">
                              {(msg) => <p className={styles.error}>{msg}</p>}
                            </ErrorMessage>
                          </div>
                          :
                          <p>{loginUserData ? loginUserData.phone_number : ''}</p>
                      }
                    </div>
                    <div className={styles.inputBox}>
                      <label htmlFor="Language">Language</label>
                      {
                        editProfile ?
                          <div>
                            <Dropdown id="Language" name="Language" className={styles.dropDown} value={props.values.Language} options={languages} onChange={(e) => props.setFieldValue('Language', e.target.value)} />
                            <ErrorMessage name="Language">
                              {(msg) => <p className={styles.error}>{msg}</p>}
                            </ErrorMessage>
                          </div>
                          :
                          <p>{loginUserData ? loginUserData.Language : ''}</p>
                      }
                    </div>
                  </div>
                </div>
              </form>
            )}
          </Formik>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default withProtectSync(Account)