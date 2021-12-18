import { useState } from 'react';
import { FaTachometerAlt, FaRegEdit, FaListUl } from 'react-icons/fa';
import { BsGrid3X3 } from "react-icons/bs";
import { MdOutlineFormatIndentDecrease, MdOutlineFormatIndentIncrease } from "react-icons/md";
import { Button } from 'primereact/button';

import ActiveLink from './ActiveLink'

import styles from './DashboardLayout.module.scss'

const Sidebar = () => {
    const [wideNav, setWideNav] = useState(true);

    let sidebarClass = styles.sidebar;
    if (!wideNav) {
        sidebarClass = styles.sidebar + ' ' + styles.narrowSide;
    }
    return (
        <aside className={sidebarClass}>
            <ul>
                <li>
                    <ActiveLink activeClassName={styles.active} href="/profile/account">
                        <a className={styles.navLink}>
                            <FaTachometerAlt />
                            {
                                wideNav ? <span>Your account</span> : null
                            }
                        </a>
                    </ActiveLink>
                </li>
                <li>
                    <ActiveLink activeClassName={styles.active} href="/profile/login">
                        <a className={styles.navLink}>
                            <FaRegEdit />
                            {
                                wideNav ? <span>Login & Security</span> : null
                            }
                        </a>
                    </ActiveLink>
                </li>
                <li>
                    <ActiveLink activeClassName={styles.active} href="/profile/billing">
                        <a className={styles.navLink}>
                            <BsGrid3X3 />
                            {
                                wideNav ? <span>Billing Information</span> : null
                            }
                        </a>
                    </ActiveLink>
                </li>
                <li>
                    <ActiveLink activeClassName={styles.active} href="/profile/team">
                        <a className={styles.navLink}>
                            <FaListUl />
                            {
                                wideNav ? <span>Manage Team</span> : null
                            }
                        </a>
                    </ActiveLink>
                </li>
            </ul>
            <div className={styles.navFooter}>
                {
                    wideNav ?
                        <Button onClick={() => setWideNav(false)} className={styles.sideToggle}><MdOutlineFormatIndentDecrease /></Button>
                        :
                        <Button onClick={() => setWideNav(true)} className={styles.sideToggle}><MdOutlineFormatIndentIncrease /></Button>
                }

            </div>
        </aside>
    )
}

export default Sidebar