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
import html2canvas from 'html2canvas';
import { jsPDF } from "jspdf";

// Style and Component Imports
import CustomPagination from '../../components/CustomPagination'
import layoutStyles from '../../styles/Home.module.scss';
import styles from '../../styles/product.module.scss';
import { withProtectSync } from "../../utils/protect"
import DashboardLayout from '../../components/DashboardLayout';

// Interface/Helper Imports
import service from '../../helper/api/api';
import { assignRows, chartData } from '../../interface/report'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const CsvCompare: NextPage = (props: any) => {
    const router = useRouter();
    // Pagination States
    const [totalRecords, setTotalRecords] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [assigneeIds, setAssigneeIds] = useState([])
    const [assigneeCurrent, setAssigneeCurrent] = useState('')

    let currentNewDate = new Date();
    let prevNewDate = new Date();
    prevNewDate.setDate(prevNewDate.getDate() - 7)

    const [rangeDate, setRangeDate] = useState<Date[] | undefined>([prevNewDate, currentNewDate]);
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
            try {
                let authToken = await window.localStorage.getItem('authToken');

                if (!authToken) {
                    window.localStorage.removeItem("authToken")
                    window.localStorage.removeItem("ValidUser")
                    window.localStorage.removeItem('loginUserdata');
                    return router.push('/auth');
                }

                let startDate;
                let endDate;

                if (rangeDate && rangeDate[0] && rangeDate[1]) {
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
                    query = { start: startDate, end: endDate, assignee: assigneeCurrent }
                } else {
                    query = { start: startDate, end: endDate }
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
            } catch (err) {
                return await toast({ type: "error", message: err });
            }
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
        data.map((el: any) => {
            let color = getRandomColor();
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

    const exportPdfHandler = async () => {
        let el = document.getElementById('forPdf')
        if (el) {
            html2canvas(el).then(canvas => {
                // document.body.appendChild(canvas)
                console.log(canvas);

                const imgData: any = canvas.toDataURL('image/png');
                const pdf = new jsPDF();
                pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
                // pdf.output('dataurlnewwindow');
                pdf.save("report.pdf");

            });
        }
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
                        <h5 className={styles.backBar}><button className={styles.backBtn} onClick={() => router.back()}><FiArrowLeft /></button> Report Selection</h5>
                    </div>
                </div>
            </div>
            <div className={layoutStyles.box} id="forPdf">
                <div className={layoutStyles.headContentBox + " p-mb-5"}>
                    <div className={layoutStyles.head}>
                        <div className={'p-d-flex p-ai-center ' + styles.reportHead}>
                            <div className={styles.reportSelect}>
                                <label htmlFor=""><FiUser /> Assignee</label>
                                <Dropdown id="compareId" className={styles.selectBox} name="column" value={assigneeCurrent} options={assigneeIds} onChange={(e) => setAssigneeCurrent(e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <Calendar disabled={!assignData || !assignData.length} dateFormat="dd/mm/yy" id="navigatorstemplate" value={rangeDate} selectionMode="range" onChange={(e: any) => setRangeDate(e.value)} monthNavigator yearNavigator yearRange="2010:2030" monthNavigatorTemplate={monthNavigatorTemplate} yearNavigatorTemplate={yearNavigatorTemplate} showIcon />
                            <button disabled={!assignData || !assignData.length} className={layoutStyles.customBlueBgbtn} onClick={() => exportPdfHandler()}>Export Report</button>
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
                                assignData && assignData.length ?
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
                                                    <td>{el.fix_range}</td>
                                                    <td>{el.avg}</td>
                                                </tr>
                                            })
                                        }
                                    </tbody>
                                </table>
                                : <p className='p-text-center'>No data found</p>
                            }
                        </div>

                        {
                            Math.ceil(totalRecords / perPage) >= 1 && assignData && assignData.length ?
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

        </DashboardLayout>
    )
}

export default withProtectSync(CsvCompare)
