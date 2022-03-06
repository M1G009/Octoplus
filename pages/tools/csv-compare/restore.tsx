// React Module Imports
import React, { useEffect, useState } from 'react'
// Next Module Imports
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import Link from 'next/link'

// Prime React Imports
import { confirmDialog } from 'primereact/confirmdialog';

// 3rd Party Imports
import { ToastContainer } from "react-toastify";
import toast from "../../../components/Toast";

// Style and Component Imports
import layoutStyles from '../../../styles/Home.module.scss';
import styles from '../../../styles/product.module.scss';
import { withProtectSync } from "../../../utils/protect"
import DashboardLayout from '../../../components/DashboardLayout';

// Interface/Helper Imports
import service from '../../../helper/api/api';
import { contactFixingFields, mainColumns, subColumns } from '../../../interface/restore'

const CsvCompare: NextPage = (props: any) => {
    const router = useRouter();
    const [restoreData, setRestoreData] = useState([])
    const [currentData, setCurrentData] = useState<any>('')
    const [registryId, setRegistryId] = useState([]);
    const [registryRowId, setRegistryRowId] = useState([]);
    const [dashBoardSpinner, setDashBoardSpinner] = useState(false);


    useEffect(() => {
        async function checkQuery() {
            if (window.location.href) {
                const urlSearchParams = new URLSearchParams(window.location.search)
                let registry_id: any = urlSearchParams.get('registry_id')
                let row_id: any = urlSearchParams.get('row_id')

                if (!registry_id || !row_id) return router.push('/');

                if (registry_id && row_id) {
                    try {
                        setRegistryId(registry_id)
                        setRegistryRowId(row_id)
                        let authToken = await window.localStorage.getItem('authToken');

                        if (!authToken) {
                            window.localStorage.removeItem("authToken")
                            window.localStorage.removeItem("ValidUser")
                            window.localStorage.removeItem('loginUserdata');
                            return router.push('/auth');
                        }
                        setDashBoardSpinner(true)
                        const { data } = await service({
                            url: `https://octoplusapi.herokuapp.com/orignal`,
                            method: 'POST',
                            data: JSON.stringify({ registry_id, row_id }),
                            headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) }
                        });

                        if (data.data.length) {
                            setRestoreData(data.data)
                            setCurrentData(data.data[0])
                        }
                        setDashBoardSpinner(false)
                    } catch (err) {
                        setDashBoardSpinner(false)
                        return await toast({ type: "error", message: err });
                    }
                }
            }
        }
        checkQuery();

    }, [])
    
    const restoreColumnHandler = async () => {
        try {
            let authToken = await window.localStorage.getItem('authToken');

            if (!authToken) {
                window.localStorage.removeItem("authToken")
                window.localStorage.removeItem("ValidUser")
                window.localStorage.removeItem('loginUserdata');
                return router.push('/auth');
            }

            setDashBoardSpinner(true)
            if (currentData) {
                const { data } = await service({
                    url: `https://octoplusapi.herokuapp.com/restoredata`,
                    method: 'POST',
                    data: JSON.stringify({ registry_id: registryId, row_id: registryRowId }),
                    headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) }
                });
            }
            setDashBoardSpinner(false)
            await toast({ type: "success", message: "Data Restored" });
            router.push('/')

        } catch (err) {
            setDashBoardSpinner(false)
            return await toast({ type: "error", message: err });
        }
    }

    const ignoreMappingDialogHandler = async () => {
        confirmDialog({
            message: 'Are you sure you want to ignore?',
            header: 'Ignore Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            accept: () => router.push('/')
        });
    }

    const restoreDialogHandler = async () => {
        confirmDialog({
            message: 'Are you sure you want to restore registry?',
            header: 'Restore Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            accept: () => restoreColumnHandler()
        });
    }

    const activeRestoreDataHandler = (id: string) => {
        let selectedData = restoreData.find((el: any) => el._id == id);
        setCurrentData(selectedData);

    }


    return (
        <DashboardLayout sidebar={false}>
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
                <div className='p-d-flex p-ai-center p-jc-between'>
                    <div>
                        <p className={styles.breadcrumButtons}><Link href="/tools/csv-compare">CSV Compare</Link> / <span>Dashboard</span></p>
                        <h5>Dashboard</h5>
                    </div>
                </div>
            </div>
            <div className={layoutStyles.box}>
                <div className={layoutStyles.headContentBox}>
                    <div className={layoutStyles.textBox}>
                        <div className={styles.restore + ' p-d-flex p-flex-md-row ' + styles.dashboardContainer}>
                            {
                                dashBoardSpinner ? <div className={styles.formSpinner}>
                                    <div className={styles.loading}></div>
                                </div> : null
                            }
                            <div className={styles.detailsBox + " customCheckBox"}>
                                <div className={styles.textBox}>
                                    {/* <div className={styles.headBox + " p-d-flex p-ai-center p-jc-between"}>
                                        <div className={styles.columnHead}>
                                            <div className='p-d-flex p-ai-center p-mb-3'>
                                                <h4>{subActiveColumnValue.value}</h4>
                                                <p className='p-ml-2'>{subActiveColumnValue.registry} Registry, {subActiveColumnValue.csv} CSV</p>
                                            </div>
                                            <p className={styles.text}>Kindly select below data to perform desire action</p>
                                        </div>
                                        {
                                            registryEntries && registryEntries.length && csvEntries && csvEntries.length ?
                                                <button className={layoutStyles.customBluebtn} onClick={() => assignContactModalHandler()} >Assign Contact Fixing</button>
                                                : ""
                                        }
                                    </div> */}
                                    <div className={styles.bottomBox}>
                                        <div className={styles.titleText + " " + styles.restoreBy}>
                                            <h6>
                                                Registry Database
                                            </h6>

                                            <div className={styles.restoreBox}>
                                                {currentData.created_date ? <p>Created at:<br /> <span>{currentData.created_date}</span></p> : ""}
                                                {currentData.restore_by ? <p className='p-m-0'>Created by:<br /> <span>{currentData.restore_by}</span></p> : ""}
                                            </div>
                                        </div>
                                        <div className={styles.dataBox + " customDashboardRadio " + styles.registryDataBox}>
                                            {
                                                currentData && currentData.current ?
                                                    <div className='p-mx-3'>
                                                        {
                                                            Object.keys(currentData.current).map((item, index) => {
                                                                return <div key={"registrydata" + index} className='p-d-flex p-ai-center p-mb-2'>
                                                                    <label htmlFor="">{item}</label>
                                                                    <p>{currentData.current[item]}</p>
                                                                </div>
                                                            })
                                                        }
                                                    </div>
                                                    : ""
                                            }
                                        </div>
                                        <div className={styles.titleText}>
                                            <h6>
                                                Previous Version
                                            </h6>
                                        </div>
                                        <div className={styles.dataBox + " customDashboardRadio " + styles.csvDataBox}>
                                            {
                                                currentData && currentData.previous.length ?
                                                    currentData.previous.map((el: any, i: any) => {

                                                        return <div className='p-mx-3' key={"csvdataP" + i}>
                                                            {
                                                                Object.keys(el).map((item, index) => {
                                                                    return <div key={"csvdata" + i + index} className='p-d-flex p-ai-center p-mb-2'>
                                                                        <label htmlFor="">{item}</label>
                                                                        <p>{el[item]}</p>
                                                                    </div>
                                                                })
                                                            }
                                                        </div>


                                                    })
                                                    : ""
                                            }
                                        </div>
                                    </div>
                                </div>
                                <div className="p-mt-3 p-text-right">
                                    <button type='button' className={layoutStyles.customDarkBgbtn} onClick={() => { ignoreMappingDialogHandler() }} >Ignore</button>

                                    <button type='button' onClick={() => { restoreDialogHandler() }} className={layoutStyles.customBlueBgbtn}>Restore</button>
                                </div>
                            </div>
                            <div className={styles.restoresPoints}>
                                <h4>Version History</h4>
                                <div className={styles.restoreBtnBox}>
                                    {
                                        restoreData && restoreData.length ?
                                            restoreData.map((el: any, i: number) => {

                                                if (el._id == currentData._id) {
                                                    return <button key={"restoreBtn" + i} className={styles.active}>
                                                        <span>{el.restore_by}</span>
                                                        <span>{el.created_date}</span>
                                                    </button>
                                                } else {
                                                    return <button key={"restoreBtn" + i} onClick={() => activeRestoreDataHandler(el._id)}>
                                                        <span>{el.restore_by}</span>
                                                        <span>{el.created_date}</span>
                                                    </button>
                                                }

                                            })
                                            : ""
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </DashboardLayout>
    )
}

export default withProtectSync(CsvCompare)
