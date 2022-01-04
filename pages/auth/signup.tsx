// React Module Imports
import { useState } from 'react'

// Next Module Imports
import type { NextPage } from 'next'
import Link from 'next/link'
import { setCookies, getCookie } from 'cookies-next';
import { useRouter } from 'next/router'
import Image from 'next/image'

// Prime React Imports
import { Dropdown } from 'primereact/dropdown';
import { Password } from 'primereact/password';
import { Checkbox } from 'primereact/checkbox';

// 3rd Party Imports
import { ErrorMessage, Formik, Field, FormikHelpers } from 'formik';
import * as yup from 'yup';

// Style and Component Imports
import styles from '../../styles/Auth.module.scss'
import Layout from '../../components/layout'
import Logo from '../../public/images/logo_authentication.svg'
import { withAuthSync } from '../../utils/auth'

// Interface/Helper Imports
import service from '../../helper/api/api';

interface Values {
    username: string,
    email: string,
    password: string,
    confirmpassword: string,
    location: {
        name: string;
        code: string;
    },
    termscheck: boolean
}

const Signup: NextPage = () => {
    const router = useRouter();
    const [errorMessage, setErrorMessage] = useState('');
    const [authSpinner, setAuthSpinner] = useState(false);

    const countriesData = [
        { "name": "Select your country", "code": "" },
        {
            "name": "Afghanistan",
            "code": "+93"
        },
        {
            "name": "Albania",
            "code": "+355"
        },
        {
            "name": "Algeria",
            "code": "+213"
        },
        {
            "name": "American Samoa",
            "code": "+1"
        },
        {
            "name": "Andorra",
            "code": "+376"
        },
        {
            "name": "Angola",
            "code": "+244"
        },
        {
            "name": "Anguilla",
            "code": "+1"
        },
        {
            "name": "Antigua",
            "code": "+1"
        },
        {
            "name": "Argentina",
            "code": "+54"
        },
        {
            "name": "Armenia",
            "code": "+374"
        },
        {
            "name": "Aruba",
            "code": "+297"
        },
        {
            "name": "Australia",
            "code": "+61"
        },
        {
            "name": "Austria",
            "code": "+43"
        },
        {
            "name": "Azerbaijan",
            "code": "+994"
        },
        {
            "name": "Bahrain",
            "code": "+973"
        },
        {
            "name": "Bangladesh",
            "code": "+880"
        },
        {
            "name": "Barbados",
            "code": "+1"
        },
        {
            "name": "Belarus",
            "code": "+375"
        },
        {
            "name": "Belgium",
            "code": "+32"
        },
        {
            "name": "Belize",
            "code": "+501"
        },
        {
            "name": "Benin",
            "code": "+229"
        },
        {
            "name": "Bermuda",
            "code": "+1"
        },
        {
            "name": "Bhutan",
            "code": "+975"
        },
        {
            "name": "Bolivia",
            "code": "+591"
        },
        {
            "name": "Bosnia and Herzegovina",
            "code": "+387"
        },
        {
            "name": "Botswana",
            "code": "+267"
        },
        {
            "name": "Brazil",
            "code": "+55"
        },
        {
            "name": "British Indian Ocean Territory",
            "code": "+246"
        },
        {
            "name": "British Virgin Islands",
            "code": "+1"
        },
        {
            "name": "Brunei",
            "code": "+673"
        },
        {
            "name": "Bulgaria",
            "code": "+359"
        },
        {
            "name": "Burkina Faso",
            "code": "+226"
        },
        {
            "name": "Burma Myanmar",
            "code": "+95"
        },
        {
            "name": "Burundi",
            "code": "+257"
        },
        {
            "name": "Cambodia",
            "code": "+855"
        },
        {
            "name": "Cameroon",
            "code": "+237"
        },
        {
            "name": "Canada",
            "code": "+1"
        },
        {
            "name": "Cape Verde",
            "code": "+238"
        },
        {
            "name": "Cayman Islands",
            "code": "+1"
        },
        {
            "name": "Central African Republic",
            "code": "+236"
        },
        {
            "name": "Chad",
            "code": "+235"
        },
        {
            "name": "Chile",
            "code": "+56"
        },
        {
            "name": "China",
            "code": "+86"
        },
        {
            "name": "Colombia",
            "code": "+57"
        },
        {
            "name": "Comoros",
            "code": "+269"
        },
        {
            "name": "Cook Islands",
            "code": "+682"
        },
        {
            "name": "Costa Rica",
            "code": "+506"
        },
        {
            "name": "Côte d'Ivoire",
            "code": "+225"
        },
        {
            "name": "Croatia",
            "code": "+385"
        },
        {
            "name": "Cuba",
            "code": "+53"
        },
        {
            "name": "Cyprus",
            "code": "+357"
        },
        {
            "name": "Czech Republic",
            "code": "+420"
        },
        {
            "name": "Democratic Republic of Congo",
            "code": "+243"
        },
        {
            "name": "Denmark",
            "code": "+45"
        },
        {
            "name": "Djibouti",
            "code": "+253"
        },
        {
            "name": "Dominica",
            "code": "+1"
        },
        {
            "name": "Dominican Republic",
            "code": "+1"
        },
        {
            "name": "Ecuador",
            "code": "+593"
        },
        {
            "name": "Egypt",
            "code": "+20"
        },
        {
            "name": "El Salvador",
            "code": "+503"
        },
        {
            "name": "Equatorial Guinea",
            "code": "+240"
        },
        {
            "name": "Eritrea",
            "code": "+291"
        },
        {
            "name": "Estonia",
            "code": "+372"
        },
        {
            "name": "Ethiopia",
            "code": "+251"
        },
        {
            "name": "Falkland Islands",
            "code": "+500"
        },
        {
            "name": "Faroe Islands",
            "code": "+298"
        },
        {
            "name": "Federated States of Micronesia",
            "code": "+691"
        },
        {
            "name": "Fiji",
            "code": "+679"
        },
        {
            "name": "Finland",
            "code": "+358"
        },
        {
            "name": "France",
            "code": "+33"
        },
        {
            "name": "French Guiana",
            "code": "+594"
        },
        {
            "name": "French Polynesia",
            "code": "+689"
        },
        {
            "name": "Gabon",
            "code": "+241"
        },
        {
            "name": "Georgia",
            "code": "+995"
        },
        {
            "name": "Germany",
            "code": "+49"
        },
        {
            "name": "Ghana",
            "code": "+233"
        },
        {
            "name": "Gibraltar",
            "code": "+350"
        },
        {
            "name": "Greece",
            "code": "+30"
        },
        {
            "name": "Greenland",
            "code": "+299"
        },
        {
            "name": "Grenada",
            "code": "+1"
        },
        {
            "name": "Guadeloupe",
            "code": "+590"
        },
        {
            "name": "Guam",
            "code": "+1"
        },
        {
            "name": "Guatemala",
            "code": "+502"
        },
        {
            "name": "Guinea",
            "code": "+224"
        },
        {
            "name": "Guinea-Bissau",
            "code": "+245"
        },
        {
            "name": "Guyana",
            "code": "+592"
        },
        {
            "name": "Haiti",
            "code": "+509"
        },
        {
            "name": "Honduras",
            "code": "+504"
        },
        {
            "name": "Hong Kong",
            "code": "+852"
        },
        {
            "name": "Hungary",
            "code": "+36"
        },
        {
            "name": "Iceland",
            "code": "+354"
        },
        {
            "name": "India",
            "code": "+91"
        },
        {
            "name": "Indonesia",
            "code": "+62"
        },
        {
            "name": "Iran",
            "code": "+98"
        },
        {
            "name": "Iraq",
            "code": "+964"
        },
        {
            "name": "Ireland",
            "code": "+353"
        },
        {
            "name": "Israel",
            "code": "+972"
        },
        {
            "name": "Italy",
            "code": "+39"
        },
        {
            "name": "Jamaica",
            "code": "+1"
        },
        {
            "name": "Japan",
            "code": "+81"
        },
        {
            "name": "Jordan",
            "code": "+962"
        },
        {
            "name": "Kazakhstan",
            "code": "+7"
        },
        {
            "name": "Kenya",
            "code": "+254"
        },
        {
            "name": "Kiribati",
            "code": "+686"
        },
        {
            "name": "Kosovo",
            "code": "+381"
        },
        {
            "name": "Kuwait",
            "code": "+965"
        },
        {
            "name": "Kyrgyzstan",
            "code": "+996"
        },
        {
            "name": "Laos",
            "code": "+856"
        },
        {
            "name": "Latvia",
            "code": "+371"
        },
        {
            "name": "Lebanon",
            "code": "+961"
        },
        {
            "name": "Lesotho",
            "code": "+266"
        },
        {
            "name": "Liberia",
            "code": "+231"
        },
        {
            "name": "Libya",
            "code": "+218"
        },
        {
            "name": "Liechtenstein",
            "code": "+423"
        },
        {
            "name": "Lithuania",
            "code": "+370"
        },
        {
            "name": "Luxembourg",
            "code": "+352"
        },
        {
            "name": "Macau",
            "code": "+853"
        },
        {
            "name": "Macedonia",
            "code": "+389"
        },
        {
            "name": "Madagascar",
            "code": "+261"
        },
        {
            "name": "Malawi",
            "code": "+265"
        },
        {
            "name": "Malaysia",
            "code": "+60"
        },
        {
            "name": "Maldives",
            "code": "+960"
        },
        {
            "name": "Mali",
            "code": "+223"
        },
        {
            "name": "Malta",
            "code": "+356"
        },
        {
            "name": "Marshall Islands",
            "code": "+692"
        },
        {
            "name": "Martinique",
            "code": "+596"
        },
        {
            "name": "Mauritania",
            "code": "+222"
        },
        {
            "name": "Mauritius",
            "code": "+230"
        },
        {
            "name": "Mayotte",
            "code": "+262"
        },
        {
            "name": "Mexico",
            "code": "+52"
        },
        {
            "name": "Moldova",
            "code": "+373"
        },
        {
            "name": "Monaco",
            "code": "+377"
        },
        {
            "name": "Mongolia",
            "code": "+976"
        },
        {
            "name": "Montenegro",
            "code": "+382"
        },
        {
            "name": "Montserrat",
            "code": "+1"
        },
        {
            "name": "Morocco",
            "code": "+212"
        },
        {
            "name": "Mozambique",
            "code": "+258"
        },
        {
            "name": "Namibia",
            "code": "+264"
        },
        {
            "name": "Nauru",
            "code": "+674"
        },
        {
            "name": "Nepal",
            "code": "+977"
        },
        {
            "name": "Netherlands",
            "code": "+31"
        },
        {
            "name": "Netherlands Antilles",
            "code": "+599"
        },
        {
            "name": "New Caledonia",
            "code": "+687"
        },
        {
            "name": "New Zealand",
            "code": "+64"
        },
        {
            "name": "Nicaragua",
            "code": "+505"
        },
        {
            "name": "Niger",
            "code": "+227"
        },
        {
            "name": "Nigeria",
            "code": "+234"
        },
        {
            "name": "Niue",
            "code": "+683"
        },
        {
            "name": "Norfolk Island",
            "code": "+672"
        },
        {
            "name": "North Korea",
            "code": "+850"
        },
        {
            "name": "Northern Mariana Islands",
            "code": "+1"
        },
        {
            "name": "Norway",
            "code": "+47"
        },
        {
            "name": "Oman",
            "code": "+968"
        },
        {
            "name": "Pakistan",
            "code": "+92"
        },
        {
            "name": "Palau",
            "code": "+680"
        },
        {
            "name": "Palestine",
            "code": "+970"
        },
        {
            "name": "Panama",
            "code": "+507"
        },
        {
            "name": "Papua New Guinea",
            "code": "+675"
        },
        {
            "name": "Paraguay",
            "code": "+595"
        },
        {
            "name": "Peru",
            "code": "+51"
        },
        {
            "name": "Philippines",
            "code": "+63"
        },
        {
            "name": "Poland",
            "code": "+48"
        },
        {
            "name": "Portugal",
            "code": "+351"
        },
        {
            "name": "Puerto Rico",
            "code": "+1"
        },
        {
            "name": "Qatar",
            "code": "+974"
        },
        {
            "name": "Republic of the Congo",
            "code": "+242"
        },
        {
            "name": "Réunion",
            "code": "+262"
        },
        {
            "name": "Romania",
            "code": "+40"
        },
        {
            "name": "Russia",
            "code": "+7"
        },
        {
            "name": "Rwanda",
            "code": "+250"
        },
        {
            "name": "Saint Barthélemy",
            "code": "+590"
        },
        {
            "name": "Saint Helena",
            "code": "+290"
        },
        {
            "name": "Saint Kitts and Nevis",
            "code": "+1"
        },
        {
            "name": "Saint Martin",
            "code": "+590"
        },
        {
            "name": "Saint Pierre and Miquelon",
            "code": "+508"
        },
        {
            "name": "Saint Vincent and the Grenadines",
            "code": "+1"
        },
        {
            "name": "Samoa",
            "code": "+685"
        },
        {
            "name": "San Marino",
            "code": "+378"
        },
        {
            "name": "São Tomé and Príncipe",
            "code": "+239"
        },
        {
            "name": "Saudi Arabia",
            "code": "+966"
        },
        {
            "name": "Senegal",
            "code": "+221"
        },
        {
            "name": "Serbia",
            "code": "+381"
        },
        {
            "name": "Seychelles",
            "code": "+248"
        },
        {
            "name": "Sierra Leone",
            "code": "+232"
        },
        {
            "name": "Singapore",
            "code": "+65"
        },
        {
            "name": "Slovakia",
            "code": "+421"
        },
        {
            "name": "Slovenia",
            "code": "+386"
        },
        {
            "name": "Solomon Islands",
            "code": "+677"
        },
        {
            "name": "Somalia",
            "code": "+252"
        },
        {
            "name": "South Africa",
            "code": "+27"
        },
        {
            "name": "South Korea",
            "code": "+82"
        },
        {
            "name": "Spain",
            "code": "+34"
        },
        {
            "name": "Sri Lanka",
            "code": "+94"
        },
        {
            "name": "St. Lucia",
            "code": "+1"
        },
        {
            "name": "Sudan",
            "code": "+249"
        },
        {
            "name": "Suriname",
            "code": "+597"
        },
        {
            "name": "Swaziland",
            "code": "+268"
        },
        {
            "name": "Sweden",
            "code": "+46"
        },
        {
            "name": "Switzerland",
            "code": "+41"
        },
        {
            "name": "Syria",
            "code": "+963"
        },
        {
            "name": "Taiwan",
            "code": "+886"
        },
        {
            "name": "Tajikistan",
            "code": "+992"
        },
        {
            "name": "Tanzania",
            "code": "+255"
        },
        {
            "name": "Thailand",
            "code": "+66"
        },
        {
            "name": "The Bahamas",
            "code": "+1"
        },
        {
            "name": "The Gambia",
            "code": "+220"
        },
        {
            "name": "Timor-Leste",
            "code": "+670"
        },
        {
            "name": "Togo",
            "code": "+228"
        },
        {
            "name": "Tokelau",
            "code": "+690"
        },
        {
            "name": "Tonga",
            "code": "+676"
        },
        {
            "name": "Trinidad and Tobago",
            "code": "+1"
        },
        {
            "name": "Tunisia",
            "code": "+216"
        },
        {
            "name": "Turkey",
            "code": "+90"
        },
        {
            "name": "Turkmenistan",
            "code": "+993"
        },
        {
            "name": "Turks and Caicos Islands",
            "code": "+1"
        },
        {
            "name": "Tuvalu",
            "code": "+688"
        },
        {
            "name": "Uganda",
            "code": "+256"
        },
        {
            "name": "Ukraine",
            "code": "+380"
        },
        {
            "name": "United Arab Emirates",
            "code": "+971"
        },
        {
            "name": "United Kingdom",
            "code": "+44"
        },
        {
            "name": "United States",
            "code": "+1"
        },
        {
            "name": "Uruguay",
            "code": "+598"
        },
        {
            "name": "US Virgin Islands",
            "code": "+1"
        },
        {
            "name": "Uzbekistan",
            "code": "+998"
        },
        {
            "name": "Vanuatu",
            "code": "+678"
        },
        {
            "name": "Vatican City",
            "code": "+39"
        },
        {
            "name": "Venezuela",
            "code": "+58"
        },
        {
            "name": "Vietnam",
            "code": "+84"
        },
        {
            "name": "Wallis and Futuna",
            "code": "+681"
        },
        {
            "name": "Yemen",
            "code": "+967"
        },
        {
            "name": "Zambia",
            "code": "+260"
        },
        {
            "name": "Zimbabwe",
            "code": "+263"
        }
    ]

    const validationSchema = yup.object().shape({
        username: yup
      .string()
      .matches(/^[A-Za-z ]*$/, 'Please enter valid user name')
      .max(40)
      .required('Please enter user name'),
        email: yup.string().required('Please enter email').email("Please enter valid email"),
        password: yup.string().required('Please enter password').min(8, 'Password is too short - should be 8 chars minimum'),
        confirmpassword: yup.string().required('Please enter confirm password').oneOf([yup.ref('password'), null], 'Passwords must match'),
        location: yup.object().shape({
            name: yup.string().required("Please select country"),
            code: yup.string().required("Please select country"),
        }),
        termscheck: yup.boolean().required("The terms and conditions must be accepted.").oneOf([true], "The terms and conditions must be accepted.")
    });

    const signUpFormHandler = async (userData: any) => {
        try {
            setAuthSpinner(true)
            let newUser = JSON.parse(userData);
            let userLocation = newUser.location;
            newUser['location'] = { "country_name": userLocation.name, "country_code": userLocation.code }
            newUser['profile_photo'] = "/static/images/avatar.png"
            delete newUser.termscheck;
            delete newUser.confirmpassword;

            const { data } = await service({
                url: `${process.env.API_BASE_URL}/user/signup`,
                method: 'POST',
                data: JSON.stringify(newUser),
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (data.status != 200) {
                setErrorMessage(data.message)
                return setAuthSpinner(false);
            }
            let setUser = Date.now() + userData.email;
            window.localStorage.setItem('loginUserdata', JSON.stringify(data.data[0]));
            window.localStorage.setItem('authToken', JSON.stringify(data.data[0].token));
            window.localStorage.setItem('ValidUser', setUser);
            await setCookies('ValidUser', setUser);
            await setErrorMessage('')
            setAuthSpinner(false)
            router.push('/');
        } catch (err: any) {
            setErrorMessage(err.message)
            setAuthSpinner(false);
        }
    }

    return (
        <Layout header={false}>
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
                            username: '',
                            email: '',
                            password: '',
                            confirmpassword: '',
                            location: { "name": "Select your country", "code": "" },
                            termscheck: false
                        }}
                        validationSchema={validationSchema}
                        onSubmit={(
                            values: Values,
                            { setSubmitting }: FormikHelpers<Values>
                        ) => {
                            signUpFormHandler(JSON.stringify(values, null, 2));
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

                                    <Field type="text" name="username" />
                                    <ErrorMessage name="username">
                                        {(msg) => <p className={styles.error}>{msg}</p>}
                                    </ErrorMessage>
                                </div>

                                <div className={styles.inputBox}>
                                    <label htmlFor="email">Email address</label>
                                    <Field type="email" name="email" />
                                    <ErrorMessage name="email">
                                        {(msg) => <p className={styles.error}>{msg}</p>}
                                    </ErrorMessage>
                                </div>

                                <div className={styles.passconFields + " p-d-flex"}>
                                    <div className={styles.inputBox + " p-mr-3 w-50"}>
                                        <label htmlFor="password">Password</label>
                                        <Field name="password">
                                            {({ field }: any) => (
                                                <Password {...field} toggleMask feedback={false} />
                                            )}
                                        </Field>
                                        <ErrorMessage name="password">
                                            {(msg) => <p className={styles.error}>{msg}</p>}
                                        </ErrorMessage>
                                    </div>

                                    <div className={styles.inputBox + " w-50"}>
                                        <label htmlFor="confirmpassword">Confirm Password</label>
                                        <Field name="confirmpassword">
                                            {({ field }: any) => (
                                                <Password {...field} toggleMask feedback={false} />
                                            )}
                                        </Field>
                                        <ErrorMessage name="confirmpassword">
                                            {(msg) => <p className={styles.error}>{msg}</p>}
                                        </ErrorMessage>
                                    </div>
                                </div>

                                <div className={styles.inputBox}>
                                    <label htmlFor="location">Country</label>
                                    <Dropdown id="location" name="location" value={props.values.location} options={countriesData} optionLabel="name" onChange={(e) =>
                                        props.setFieldValue('location', e.target.value)
                                    } />
                                    <ErrorMessage name="location">
                                        {(msg: any) => <p className={styles.error}>{msg.code}</p>}
                                    </ErrorMessage>
                                </div>

                                <div className={styles.radioBox}>
                                    <div className={styles.radioInputs}>
                                        <Checkbox inputId="termsBox" name="termscheck" checked={props.values.termscheck} onChange={props.handleChange} />
                                        <label htmlFor="termsBox">
                                            I accept all
                                            <Link href="/">
                                                <a> Terms and Conditions</a>
                                            </Link>
                                        </label>
                                    </div>
                                    <ErrorMessage name="termscheck">
                                        {(msg) => <p className={styles.error}>{msg}</p>}
                                    </ErrorMessage>
                                </div>
                                {
                                    errorMessage ? <p className={styles.formError}>{errorMessage}</p> : null
                                }
                                <button type="submit">Submit</button>
                            </form>
                        )}
                    </Formik>
                </div>
            </div>
        </Layout>
    )
}

export default withAuthSync(Signup)
