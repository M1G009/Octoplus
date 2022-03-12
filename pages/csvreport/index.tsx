// React Module Imports
import React, { useEffect, useState } from 'react'
// Next Module Imports
import type { NextPage } from 'next'
import { useRouter } from 'next/router'

// Prime React Imports
import { Dropdown } from 'primereact/dropdown';

// 3rd Party Imports
import { FiArrowLeft, FiUser } from "react-icons/fi";
import { ToastContainer } from "react-toastify";
import toast from "../../components/Toast";

// Style and Component Imports
import CustomPagination from '../../components/CustomPagination'
import layoutStyles from '../../styles/Home.module.scss';
import styles from '../../styles/product.module.scss';
import { withProtectSync } from "../../utils/protect"
import DashboardLayout from '../../components/DashboardLayout';

// Interface/Helper Imports
import service from '../../helper/api/api';
import { assignRows } from '../../interface/report';

const CsvCompare: NextPage = (props: any) => {
    const router = useRouter();
    // Pagination States
    const [totalRecords, setTotalRecords] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [contacts, setContacts] = useState<any[]>([]);
    const [assigneeIds, setAssigneeIds] = useState([])
    const [assigneeCurrent, setAssigneeCurrent] = useState('')
    const [assignData, setAssignData] = useState<assignRows[]>()
    const [tableSpinner, setTableSpinner] = useState(false);

    const fetchAllCompareRecord = async (csv_id: string) => {
        try {
            let authToken = await window.localStorage.getItem('authToken');

            if (!authToken) {
                window.localStorage.removeItem("authToken")
                window.localStorage.removeItem("ValidUser")
                window.localStorage.removeItem('loginUserdata');
                return router.push('/auth');
            }
            setTableSpinner(true)
            let query;
            if (assigneeCurrent) {
                query = { csv_id, assignee: assigneeCurrent };
            } else {
                query = { csv_id }
            }
            const { data } = await service({
                url: `https://octoplusapi.herokuapp.com/pregressreportGET`,
                method: 'POST',
                data: JSON.stringify(query),
                headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) }
            });

            setAssignData(data.data[0].date);
            setAssigneeIds(data.data[0].username);
            setTableSpinner(false)
        } catch (err) {
            setTableSpinner(false)
            return await toast({ type: "error", message: err });
        }
    }

    useEffect(() => {
        async function checkQuery() {
            if (window.location.href) {
                const urlSearchParams = new URLSearchParams(window.location.search)
                let id = urlSearchParams.get('id')

                if (!id) return router.push('/tools/csv-compare');

                await fetchAllCompareRecord(id);
            }
        }
        checkQuery();
    }, [assigneeCurrent])

    const currentPageHandler = (num: number) => {
        setCurrentPage(num);
    }

    const perPageHandler = (num: number) => {
        setCurrentPage(1);
        setPerPage(num);
    }

    return (
        <>
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
            <DashboardLayout sidebar={false}>
                <div className={layoutStyles.topBar}>
                    <div className='p-d-flex p-ai-center p-jc-between'>
                        <div>
                            <h5 className={styles.backBar}><button className={styles.backBtn} onClick={() => router.back()}><FiArrowLeft /></button> Progress Details</h5>
                        </div>
                    </div>
                </div>
                <div className={layoutStyles.box}>
                    <div className={layoutStyles.headContentBox + " p-mb-5"}>
                        <div className={layoutStyles.head}>
                            <div className={'p-d-flex p-ai-center ' + styles.reportHead}>
                                <div className={styles.reportSelect}>
                                    <label htmlFor=""><FiUser /> Assignee</label>
                                    <Dropdown id="compareId" className={styles.selectBox} name="column" value={assigneeCurrent} options={assigneeIds} onChange={(e) => setAssigneeCurrent(e.target.value)} />
                                </div>
                            </div>
                        </div>
                        <div className={styles.comparisonTableBox}>
                            <div className={styles.comparisonTableOverflow}>
                                {
                                    tableSpinner ? <div className={styles.formSpinner}>
                                        <div className={styles.loading}></div>
                                    </div> : null
                                }
                                {
                                    assignData && assignData.length ?
                                        <table className={styles.comparisonTable}>
                                            <thead>
                                                <tr>
                                                    <th>Assignee Name</th>
                                                    <th>Total Contacts Assigned</th>
                                                    <th>Total Contacts Fixed</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    assignData?.map((el, i) => {
                                                        return <tr key={"asssignData" + i}>
                                                            <td>{el.username}</td>
                                                            <td>{el.total}</td>
                                                            <td>{el.fix} ({el.Perc_Com}%)</td>
                                                        </tr>
                                                    })
                                                }
                                            </tbody>
                                        </table>
                                        : <p className='p-text-center'>No data found</p>
                                }
                            </div>

                            {
                                Math.ceil(totalRecords / perPage) >= 1 && contacts.length ?
                                    <CustomPagination totalRecords={totalRecords} currentPage={currentPage} perPage={perPage} currentPageHandler={currentPageHandler} perPageHandler={perPageHandler} />
                                    : ''
                            }
                        </div>
                    </div>
                </div>

            </DashboardLayout>
        </>
    )
}

export default withProtectSync(CsvCompare)
