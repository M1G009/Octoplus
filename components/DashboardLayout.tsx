import { useEffect, useRef, useState } from 'react';
import Head from 'next/head'
import Link from 'next/link'
import { Dialog } from 'primereact/dialog';
import { BsEnvelope, BsGraphUp, BsPlusCircle } from 'react-icons/bs';
import { BiCode } from 'react-icons/bi';
import { FaRegUserCircle, FaUsers, FaFileCsv, FaFileExport, FaFileExcel } from 'react-icons/fa';
import { FiAward } from 'react-icons/fi';
import { MdLogout, MdOutlineReportGmailerrorred } from 'react-icons/md';
import { ProgressBar } from 'primereact/progressbar';
import Header from './Header'
import Sidebar from './Sidebar'
import styles from './DashboardLayout.module.scss'
import { useRouter } from 'next/router'
import { removeCookies } from 'cookies-next';
import "react-toastify/dist/ReactToastify.css";

const DashboardLayout = (props: any) => {
    const router = useRouter();
    const wrapperRef = useRef<HTMLHeadingElement>(null);
    const userRef = useRef<HTMLHeadingElement>(null);
    const [profileModal, setProfileModal] = useState(false);
    const [emailVariValue, setEmailVariValue] = useState(15);
    const [addressVariValue, setAddressVariValue] = useState(50);
    const [restrictions, setRestrictions] = useState('')

    useEffect(() => {
        let userData = window.localStorage.getItem('loginUserdata');
        if (userData) {
            let parseData = JSON.parse(userData);
            setRestrictions(parseData.restrictions)
        }
    }, [])

    useEffect(() => {
        function handleClickOutside(event: any) {
            if (event) {
                if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                    if (userRef.current && userRef.current.contains(event.target)) {
                        setProfileModal(true);
                    } else {
                        setProfileModal(false);
                    }
                }
            }
        }

        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [wrapperRef]);

    const logoutHandler = async () => {
        removeCookies("ValidUser")
        window.localStorage.removeItem("authToken")
        window.localStorage.removeItem("ValidUser")
        window.localStorage.removeItem('loginUserdata');
        router.push('/auth');
    }

    return (
        <>
            <Head>
                <title>Octoplus</title>
            </Head>
            <Header profile={setProfileModal} userRef={userRef} restrictions={restrictions} />
            <div className="p-d-flex">
                {
                    props.sidebar ? <Sidebar /> : null
                }
                <main className={styles.main}>
                    {props.children}
                </main>
            </div>
            {/* profile-Modal */}
            <div>
                <Dialog showHeader={false} dismissableMask={true} modal={false} className={styles.profileCustomStyles} maskClassName={styles.profileDialogMask} position={'right'} visible={profileModal} style={{ width: '320px', borderRadius: "8px", overflow: "hidden" }} onHide={() => ''}>
                    <div className={styles.profileModal} ref={wrapperRef}>
                        <div className={styles.topBox}>
                            <div className={styles.progressBox}>
                                <h5><BsEnvelope />Contact (Registry)</h5>
                                <div className={styles.progress}>
                                    <ProgressBar className={styles.line} value={emailVariValue} showValue={false} style={{ height: "10px", borderRadius: "20px" }}></ProgressBar>
                                    <span>{emailVariValue}%</span>
                                </div>
                            </div>
                            <div className={styles.progressBox}>
                                <h5><FaUsers />Number of team members</h5>
                                <div className={styles.progress}>
                                    <ProgressBar className={styles.line} value={addressVariValue} showValue={false} style={{ height: "10px", borderRadius: "20px" }}></ProgressBar>
                                    <span>{addressVariValue}%</span>
                                </div>
                            </div>
                            <div className={styles.progressBox}>
                                <h5><FaFileCsv />Number of CSV upload</h5>
                                <div className={styles.progress}>
                                    <ProgressBar className={styles.line} value={addressVariValue} showValue={false} style={{ height: "10px", borderRadius: "20px" }}></ProgressBar>
                                    <span>{addressVariValue}%</span>
                                </div>
                            </div>
                            <div className={styles.progressBox}>
                                <h5><FaFileExport />Number of contact export</h5>
                                <div className={styles.progress}>
                                    <ProgressBar className={styles.line} value={addressVariValue} showValue={false} style={{ height: "10px", borderRadius: "20px" }}></ProgressBar>
                                    <span>{addressVariValue}%</span>
                                </div>
                            </div>
                            <div className={styles.progressBox}>
                                <h5><FaFileExcel />Number of excel row upload at a time</h5>
                                <div className={styles.progress}>
                                    <ProgressBar className={styles.line} value={addressVariValue} showValue={false} style={{ height: "10px", borderRadius: "20px" }}></ProgressBar>
                                    <span>{addressVariValue}%</span>
                                </div>
                            </div>
                            <div className={styles.progressBox}>
                                <h5><MdOutlineReportGmailerrorred />Report Access</h5>
                                <div className={styles.progress}>
                                    <ProgressBar className={styles.line} value={addressVariValue} showValue={false} style={{ height: "10px", borderRadius: "20px" }}></ProgressBar>
                                    <span>{addressVariValue}%</span>
                                </div>
                            </div>
                            <button className={styles.upgradeBtn}>Upgrade Plan</button>
                        </div>
                        <div className={styles.navLinks}>
                            <ul>
                                <li>
                                    <Link href={"/profile/account"}>
                                        <a>
                                            <FaRegUserCircle />
                                            Account
                                        </a>
                                    </Link>
                                </li>
                                <li>
                                    <Link href={"/#"}>
                                        <a>
                                            <FiAward />
                                            Subscription
                                        </a>
                                    </Link>
                                </li>
                                <li>
                                    <Link href={"/#"}>
                                        <a>
                                            <BsGraphUp />
                                            Usage
                                        </a>
                                    </Link>
                                </li>
                                <li>
                                    <Link href={"/#"}>
                                        <a>
                                            <BsPlusCircle />
                                            Add-ons
                                        </a>
                                    </Link>
                                </li>
                                <li>
                                    <Link href={"/#"}>
                                        <a>
                                            <BiCode />
                                            API
                                        </a>
                                    </Link>
                                </li>
                                <li>
                                    <Link href={"/#"}>
                                        <a onClick={logoutHandler}>
                                            <MdLogout />
                                            Log Out
                                        </a>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </Dialog>
            </div>
        </>
    )
}

export default DashboardLayout
