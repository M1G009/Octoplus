import Head from 'next/head'
import Header from './Header'
import Sidebar from './Sidebar'
import styles from './DashboardLayout.module.scss'
import "react-toastify/dist/ReactToastify.css";

const DashboardLayout = (props: any) => {
    return (
        <>
            <Head>
                <title>Octoplus</title>
            </Head>
            <Header />
            <div className="p-d-flex">
                {
                    props.sidebar ? <Sidebar /> : null
                }
                <main className={styles.main}>
                    {props.children}
                </main>
            </div>
        </>
    )
}

export default DashboardLayout
