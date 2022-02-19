// React Module Imports
import React, { useEffect, useState } from 'react'
// Next Module Imports
import type { NextPage } from 'next'
import { useRouter } from 'next/router'

// Prime React Imports
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Dialog } from 'primereact/dialog';

// 3rd Party Imports
import { IoGitCompareOutline } from "react-icons/io5";
import { FiArrowLeft, FiUser } from "react-icons/fi";
import { ToastContainer } from "react-toastify";
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import toast from "../../components/Toast";

// Style and Component Imports
import CustomPagination from '../../components/CustomPagination'
import layoutStyles from '../../styles/Home.module.scss';
import styles from '../../styles/product.module.scss';
import { withProtectSync } from "../../utils/protect"
import DashboardLayout from '../../components/DashboardLayout';

// Interface/Helper Imports
import service from '../../helper/api/api';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export interface assignRows {
    username: string;
    total: number;
    fix: number;
    Perc_Com: string;
    compare_name: string;
}

export interface chartData {
    username: [string];
    dates: [string];
    data: [number];
}

const CsvCompare: NextPage = (props: any) => {
    const router = useRouter();
    // Pagination States
    const [totalRecords, setTotalRecords] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [contacts, setContacts] = useState<any[]>([]);
    const [assigneeIds, setAssigneeIds] = useState([])
    const [assigneeCurrent, setAssigneeCurrent] = useState('')

    let currentNewDate = new Date();
    let prevNewDate = new Date();
    prevNewDate.setDate(prevNewDate.getDate() - 7)

    const [rangeDate, setRangeDate] = useState<Date[] | undefined>([prevNewDate, currentNewDate]);
    const [exportReportModal, setExportReportModal] = useState(false);
    const [assignData, setAssignData] = useState<assignRows[]>()
    const [graphBox, setGraphBox] = useState(false)
    const [chartData, setChartData] = useState<chartData[]>([])

    const convert = (str: any) => {
        var date = new Date(str),
            mnth = ("0" + (date.getMonth() + 1)).slice(-2),
            day = ("0" + date.getDate()).slice(-2);
        return [date.getFullYear(), mnth, day].join("-");
    }

    useEffect(() => {
        async function withDate() {
            let authToken = await window.localStorage.getItem('authToken');

            if (!authToken) {
                window.localStorage.removeItem("authToken")
                window.localStorage.removeItem("ValidUser")
                window.localStorage.removeItem('loginUserdata');
                return router.push('/auth');
            }

            let startDate;
            let endDate;

            if(rangeDate && rangeDate[0] && rangeDate[1]){
                startDate = convert(rangeDate[0]);
                endDate = convert(rangeDate[1])
            } else {
                let currentDate = new Date();
                startDate = convert(currentDate);
                currentDate.setDate(currentDate.getDate() - 7)
                endDate = convert(currentDate);
            }

            let query;
            if (assigneeCurrent) {
                query = {start: startDate, end: endDate, assignee: assigneeCurrent }
            } else {
                query = {start: startDate, end: endDate }
            }
            
            const { data } = await service({
                url: `https://octoplusapi.herokuapp.com/detailreportGET`,
                method: 'POST',
                data: JSON.stringify(query),
                headers: { 'Content-Type': 'application/json', 'Authorization': JSON.parse(authToken) }
            });

            setChartData(data.data[0].chart);
            setAssigneeIds(data.data[0].username)
            setAssignData(data.data[0].data)
            setGraphBox(true);
        }
        withDate();
    }, [rangeDate, assigneeCurrent])

    const currentPageHandler = (num: number) => {
        setCurrentPage(num);
    }

    const perPageHandler = (num: number) => {
        setCurrentPage(1);
        setPerPage(num);
    }

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'right' as const,
            },
        },
        elements: {
            point: {
                radius: 0
            }
        }
    };

    const getRandomColor = () => {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    const dataSetBuilder = (data: any) => {
        let dataArray: any = [];
        let color = getRandomColor();
        data.map((el: any) => {
            return dataArray.push({ label: el.username[0], data: el.data, borderColor: color, backgroundColor: color })
        })

        return dataArray
    }

    let labels: any[] = [];
    if (chartData.length) {
        labels = chartData[0].dates;
    }

    const data = {
        labels,
        datasets: dataSetBuilder(chartData)
    };

    const monthNavigatorTemplate = (e: any) => {
        return <Dropdown value={e.value} options={e.options} onChange={(event) => e.onChange(event.originalEvent, event.value)} style={{ lineHeight: 1 }} />;
    }

    const yearNavigatorTemplate = (e: any) => {
        return <Dropdown value={e.value} options={e.options} onChange={(event) => e.onChange(event.originalEvent, event.value)} className="p-ml-2" style={{ lineHeight: 1 }} />;
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
                        <h5><FiArrowLeft /> Report Selection</h5>
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
                        <div>
                            <Calendar dateFormat="dd/mm/yy" id="navigatorstemplate" value={rangeDate} selectionMode="range" onChange={(e: any) => setRangeDate(e.value)} monthNavigator yearNavigator yearRange="2010:2030" monthNavigatorTemplate={monthNavigatorTemplate} yearNavigatorTemplate={yearNavigatorTemplate} showIcon />
                            <button className={layoutStyles.customBlueBgbtn} onClick={() => setExportReportModal(true)}>Export Report</button>
                        </div>
                    </div>
                    <div className={styles.comparisonTableBox}>
                        <div className={styles.comparisonTableOverflow}>
                            {/* {
                                createContactTableSpinner ? <div className={styles.formSpinner}>
                                    <div className={styles.loading}></div>
                                </div> : null
                            } */}
                            {
                                // contacts.length ?
                                <table className={styles.comparisonTable}>
                                    <thead>
                                        <tr>
                                            <th>Assignee Name</th>
                                            <th>Total Contacts Assigned</th>
                                            <th>Total Contacts Fixed</th>
                                            <th>Contacts Fixed in Date Range</th>
                                            <th>Avg. Contacts Fixed in Date Range</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            assignData?.map((el, i) => {
                                                return <tr key={"asssignData" + i}>
                                                    <td>{el.username}</td>
                                                    <td>{el.total}</td>
                                                    <td>{el.fix} ({el.Perc_Com}%)</td>
                                                    <td>{el.username}</td>
                                                    <td>{el.username}</td>
                                                </tr>
                                            })
                                        }
                                        {/* <tr>
                                            <td>Suryansh</td>
                                            <td>20</td>
                                            <td>10 (50%)</td>
                                            <td>5</td>
                                            <td>0.5</td>
                                        </tr>
                                        <tr>
                                            <td>Suryansh</td>
                                            <td>20</td>
                                            <td>10 (50%)</td>
                                            <td>5</td>
                                            <td>0.5</td>
                                        </tr>
                                        <tr>
                                            <td>Suryansh</td>
                                            <td>20</td>
                                            <td>10 (50%)</td>
                                            <td>5</td>
                                            <td>0.5</td>
                                        </tr> */}
                                    </tbody>
                                </table>
                                // : <p className='p-text-center'>No data found</p>
                            }
                        </div>

                        {
                            Math.ceil(totalRecords / perPage) >= 1 && contacts.length ?
                                <CustomPagination totalRecords={totalRecords} currentPage={currentPage} perPage={perPage} currentPageHandler={currentPageHandler} perPageHandler={perPageHandler} />
                                : ''
                        }
                    </div>
                </div>
                {
                    graphBox && rangeDate && rangeDate[0] && rangeDate[1] ?
                        <div className={layoutStyles.headContentBox + " p-mb-5"}>
                            <div className={layoutStyles.head}>
                                <h4>Performance Chart</h4>
                            </div>
                            <div className={styles.comparisonTableBox}>
                                <div className='p-p-4'>
                                    <Line options={options} data={data} />
                                </div>
                            </div>
                        </div>
                        : null
                }
            </div>

            {/* Export Report Modal */}
            <Dialog showHeader={false} contentClassName={styles.modelsCustomStyles} maskClassName={styles.dialogMask} visible={exportReportModal} style={{ width: '500px', }} onHide={() => ''}>
                <div className={styles.replaceDataModal}>
                    <h5>Export Report</h5>
                    <div className={styles.contactDetails}>
                        <div className={styles.textBox}>
                            <p className='p-m-auto'>
                                Choose for export type
                            </p>
                        </div>
                        <div className='p-mt-4 p-text-center'>
                            <button className={layoutStyles.customBluebtn} onClick={() => setExportReportModal(false)}>Export in PDF</button>
                            <button className={layoutStyles.customBluebtn} onClick={() => setExportReportModal(false)}>Export in CSV</button>
                        </div>
                    </div>
                </div>
            </Dialog>

        </DashboardLayout>
    )
}

export default withProtectSync(CsvCompare)
