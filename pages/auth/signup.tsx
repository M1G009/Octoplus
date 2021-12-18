import { useState, useMemo, useEffect } from 'react'
import type { NextPage } from 'next'
import Link from 'next/link'
import styles from '../../styles/Auth.module.scss'
import Router from 'next/router'
import Layout from '../../components/layout'
import Image from 'next/image'
import Logo from '../../public/images/Logo_auth.svg'
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Formik, Field, Form, FormikHelpers } from 'formik';
import { withAuthSync } from '../../utils/auth'
import { setCookies, getCookie } from 'cookies-next';
const countryCodes = require('country-codes-list')

interface Values {
    username: string,
    email: string,
    password: string,
    confirmpassword: string,
    location: string,
    termscheck: boolean
}


const Signup: NextPage = () => {
    const [submitDisable, setSubmitDisable] = useState(true);
    const myCountryCodesObject = countryCodes.customList('countryCallingCode', '{countryNameEn}')
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState(false);

    // console.log(myCountryCodesObject);

    const [passEye, setPassEye] = useState(true);
    const [conPassEye, setConPassEye] = useState(true);

    const validateLength = (value: string) => {
        setSubmitDisable(false);
        setErrorMessage(false);
        let error;
        if (!value) {
            error = 'Required';
        }
        return error;
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
        setPassword(value);
        let error;
        if (!value) {
            error = 'Required';
        } else if (value.length < 8) {
            error = 'Invalid Password';
        }
        return error;
    }

    const validateConfirmPass = (confirmpassword: string) => {
        setSubmitDisable(false);
        setErrorMessage(false);
        let error;

        if (!password || !confirmpassword) {
            error = 'Required';
        } else if (!(password === confirmpassword)) {
            error = 'Invalid Password';
        }
        return error;
    }

    const validatecountry = (value: string) => {
        setSubmitDisable(false);
        setErrorMessage(false);
        let error;
        if (!value) {
            error = 'Required';
        }
        return error;
    }

    const validateterms = (value: boolean) => {
        setSubmitDisable(false);
        setErrorMessage(false);
        let error;
        if (!value) {
            error = 'Required';
        }
        return error;
    }

    const handleSubmit = async (userData: any) => {
        try {
            let newUser = JSON.parse(userData);
            let userLocation = newUser.location;
            newUser['location'] = { "country_name": userLocation.split(',')[1], "country_code": userLocation.split(',')[0] }
            newUser['profile_photo'] = "/static/images/avatar.png"
            delete newUser.termscheck;
            delete newUser.confirmpassword;
            // console.log(newUser);
            fetch(`${process.env.API_BASE_URL}/user/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser),
            })
                .then(res => res.json())
                .then(async res => {
                    if (res.status != 200) {
                        setErrorMessage(res.message)
                        return false;
                    }
                    let setUser = Date.now() + JSON.parse(userData).email;
                    // console.log(setUser);

                    window.localStorage.setItem('loginUserdata', JSON.stringify(res.data[0].user));
                    window.localStorage.setItem('authToken', JSON.stringify(res.data[0].token));
                    window.localStorage.setItem('ValidUser', setUser);
                    await setCookies('ValidUser', setUser);
                    await setErrorMessage(false)
                    return Router.push('/');
                })
        } catch (error: any) {
            console.error(error)
            // setSubmitDisable(false);
        }
    }

    return (
        <Layout header={false}>
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
                            username: '',
                            email: '',
                            password: '',
                            confirmpassword: '',
                            location: '',
                            termscheck: false
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
                                    <h3>Create an Account</h3>
                                    <p>
                                        Already have an account?
                                        <Link href="/auth">
                                            <a> Sign in here</a>
                                        </Link>
                                    </p>
                                </div>

                                <div className={styles.inputBox}>
                                    <label htmlFor="username">Full Name</label>
                                    <Field name="username" validate={validateLength}>
                                        {({ field }: any) => (
                                            <input type="text" {...field}
                                                className={props.values.username ? (props.errors.username ? styles.red : styles.blue) : ''}
                                                id="username"
                                            />
                                        )}
                                    </Field>
                                </div>

                                <div className={styles.inputBox}>
                                    <label htmlFor="email">Email address</label>
                                    <Field name="email" validate={validateEmail}>
                                        {({ field }: any) => (
                                            <input type="text" {...field}
                                                className={props.values.email ? (props.errors.email ? styles.red : styles.blue) : ''}
                                                id="email"
                                            />
                                        )}
                                    </Field>
                                </div>

                                <div className="p-d-flex">
                                    <div className={styles.inputBox + " p-mr-2"}>
                                        <label htmlFor="password">Password</label>
                                        <Field name="password" validate={validatePassword}>
                                            {({ field }: any) => (
                                                <div className="w-100 position-relative">
                                                    <input type={passEye ? "password" : "text"} {...field}
                                                        className={props.values.password ? (props.errors.password ? styles.red + ' w-100' : styles.blue + ' w-100') : ' w-100'}
                                                        id="password"
                                                    />
                                                    {
                                                        passEye ? <FaEye onClick={() => setPassEye(false)} /> : <FaEyeSlash onClick={() => setPassEye(true)} />
                                                    }
                                                </div>
                                            )}
                                        </Field>
                                    </div>

                                    <div className={styles.inputBox + " p-ml-2"}>
                                        <label htmlFor="confirmpassword">Confirm Password</label>
                                        <Field name="confirmpassword" validate={validateConfirmPass}>
                                            {({ field }: any) => (
                                                <div className="w-100 position-relative">
                                                    <input type={conPassEye ? "password" : "text"} {...field}
                                                        className={props.values.confirmpassword ? (props.errors.confirmpassword ? styles.red + ' w-100' : styles.blue + ' w-100') : ' w-100'}
                                                        id="confirmpassword"
                                                    />
                                                    {
                                                        conPassEye ? <FaEye onClick={() => setConPassEye(false)} /> : <FaEyeSlash onClick={() => setConPassEye(true)} />
                                                    }
                                                </div>
                                            )}
                                        </Field>
                                    </div>
                                </div>

                                <div className={styles.inputBox}>
                                    <label htmlFor="location">Country</label>
                                    <Field as="select" name="location" validate={validatecountry}>
                                        {({ field }: any) => (
                                            <select {...field} className={props.values.location ? styles.blue : ''} name="location" id="location">
                                                <option value="">Select your country</option>
                                                <option value="+91,india">+91 India</option>
                                                <option value="+1,usa">+1 USA</option>
                                            </select>
                                        )}
                                    </Field>
                                </div>

                                <div className={styles.radioBox}>
                                    <Field as="select" name="termscheck" validate={validateterms}>
                                        {({ field }: any) => (
                                            <input {...field} type="checkbox" id="termsBox" />
                                        )}
                                    </Field>
                                    <label htmlFor="termsBox">
                                        I accept all
                                        <Link href="/">
                                            <a> Terms and Conditions</a>
                                        </Link>
                                    </label>
                                </div>
                                {
                                    errorMessage ? <p className={styles.formError}>{errorMessage}</p> : null
                                }
                                <button type="submit" disabled={submitDisable || !!Object.keys(props.errors).length}>Submit</button>
                            </form>
                        )}
                    </Formik>
                </div>
            </div>
        </Layout>
    )
}

export default withAuthSync(Signup)
