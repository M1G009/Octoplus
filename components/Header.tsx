import { useEffect, useState } from 'react';
import Image from 'next/image'
import Link from 'next/link'
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { FaSearch, FaRegQuestionCircle } from "react-icons/fa";
import { Badge } from 'primereact/badge';
import { useRouter } from 'next/router'
import { removeCookies } from 'cookies-next';

import Logo from '../public/images/main_logo.svg'
import User from '../public/images/user_img.png'

import styles from './DashboardLayout.module.scss'

const Header = () => {
    const router = useRouter();
    const [searchText, setSearchText] = useState('');
    const [searchInput, setSearchInput] = useState(false);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        let userData = window.localStorage.getItem('loginUserdata');
        if (userData) {
            let parseData = JSON.parse(userData);
            setUserName(parseData.username);
          }
    }, [])

    const logoutHandler = async () => {
        removeCookies("ValidUser")
        window.localStorage.removeItem("authToken")
        window.localStorage.removeItem("ValidUser")
        window.localStorage.removeItem('loginUserdata');
        router.push('/auth');
    }

    const routerPushHandler = (url: string) => {
        return router.push(url)
    }

    return (
        <header className={styles.header}>
            <div className={styles.logo}>
                <Button onClick={() => routerPushHandler('/')} className={styles.logoBtn}>
                    <Image
                        src={Logo}
                        alt="Octoplus"
                        width={117}
                        height={29}
                    />
                </Button>
            </div>
            <div className={styles.left_navlist}>
                <Link href="/">My Registry</Link>
                <Link href="/tools/csv-compare">Tools</Link>
                <Link href="/report">Reports</Link>
            </div>
            <div className={styles.right_list}>
                <div className={styles.searchBox}>
                    {
                        searchInput ? <InputText value={searchText} onChange={(e) => setSearchText(e.target.value)} autoFocus onBlur={() => { setSearchInput(false); setSearchText('') }} /> : null
                    }
                    <Button className={"p-button-text " + styles.searchIcon} onClick={() => searchInput ? false : setSearchInput(true)} ><FaSearch /></Button>
                </div>
                <Button className={"p-button-text " + styles.searchIcon} ><FaRegQuestionCircle /></Button>
                <Button className={styles.bellIcon}><i className="pi pi-bell p-overlay-badge" style={{ fontSize: '18px' }}><Badge value="2" severity="danger" ></Badge></i></Button>
                <div className={styles.userProfile} onClick={() => routerPushHandler('/profile/account')}>
                    <Image
                        src={User}
                        className={styles.userImage}
                        alt="Octoplus"
                        width={40}
                        height={40}
                    />
                    {
                        userName ? <h6>{userName}</h6> : ''
                    }
                </div>
                <Button onClick={logoutHandler} className={"p-button-text " + styles.logoutBtn} >Logout</Button>
            </div>
        </header>
    )
}

export default Header