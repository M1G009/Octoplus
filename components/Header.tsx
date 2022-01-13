import Image from 'next/image'
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { useState } from 'react';
import { FaSearch, FaRegQuestionCircle } from "react-icons/fa";
import { Badge } from 'primereact/badge';
import { useRouter } from 'next/router'
import { removeCookies } from 'cookies-next';

import Logo from '../public/images/Logo.svg'
import User from '../public/images/user_img.png'

import styles from './DashboardLayout.module.scss'

const Header = () => {
    const router = useRouter();
    const [searchText, setSearchText] = useState('');
    const [searchInput, setSearchInput] = useState(false);

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
                <Button onClick={() => routerPushHandler('/')} className="p-button-text" label="My Registry" />
                <Button onClick={() => routerPushHandler('/tools/csv-compare')} className="p-button-text" label="Tools" />
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
                    <h6>Esther Howard</h6>
                </div>
                <Button onClick={logoutHandler} className={"p-button-text " + styles.logoutBtn} >Logout</Button>
            </div>
        </header>
    )
}

export default Header