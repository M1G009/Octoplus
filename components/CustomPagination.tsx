// React Module Imports
import React, { useState, useEffect } from 'react';

// Prime React Imports
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
// 3rd Party Imports
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

// Style and Component Imports
import styles from './CustomPagination.module.scss'

const CustomPagination = (props: any) => {
    const [pageInputTooltip, setPageInputTooltip] = useState('Press Enter key to go to this page.')
    const [pageInput, setPageInput] = useState(props.currentPage)
    let totalRecords = props.totalRecords;
    let currentPage = parseInt(props.currentPage);
    let perPage = props.perPage;
    let currentPageHandler = props.currentPageHandler;
    let perPageHandler = props.perPageHandler;
    let totalPage = Math.ceil(totalRecords / perPage)
    const dropdownOptions = [
        { label: "10 / Page", value: 10 },
        { label: "20 / Page", value: 20 },
        { label: "30 / Page", value: 30 }
    ];

    useEffect(() => {
        setPageInput(currentPage)
    }, [currentPage])

    const prevPageHandler = () => {
        if (currentPage > 0) {
            currentPageHandler(currentPage - 1);
        } else {
            currentPageHandler(1);
        }
    }

    const nextPageHandler = () => {
        if (currentPage === totalPage) {
            currentPageHandler(totalPage);
        } else {
            currentPageHandler(currentPage + 1);
        }
    }

    const onPageInputKeyDown = (event: any) => {
        if (event.key === 'Enter') {
            const page = event.target.value;
            if (page <= 0 || page > totalPage) {
                setPageInputTooltip(`Value must be between 1 and ${totalPage}.`);
            }
            else {
                currentPageHandler(event.target.value);
                setPageInputTooltip('Press Enter key to go to this page.');
            }
        }
    }

    const onPageInputChange = (event: any) => {
        let value = event.target.value;
        setPageInput(value);
    }

    return (
        <div className={styles.customPagination}>
            <div className={styles.totalItems}>
                <span className={styles.totalItemsText}>Total {totalRecords} items</span>
            </div>
            <div className={styles.prevPage}>
                <button type="button" className={styles.leftArrowIc} onClick={prevPageHandler} disabled={currentPage == 1}>
                    <FaChevronLeft />
                </button>
            </div>
            <div className={styles.pagesNum}>
                {[...Array(totalPage)].map((el, i) => {
                    if (currentPage <= 3) {
                        if (i < 5) {
                            if (i == currentPage - 1) {
                                return <button key={"numBtn" + i} type="button" className={styles.curruntPageActive + ' ' + styles.pageNumbers} onClick={() => currentPageHandler(i + 1)}>
                                    {i + 1}
                                </button>
                            }
                            return <button key={"numBtn" + i} type="button" className={styles.pageNumbers} onClick={() => currentPageHandler(i + 1)}>
                                {i + 1}
                            </button>
                        }
                    } else if (currentPage >= totalPage - 2) {
                        if (i >= totalPage - 5) {
                            if (i == currentPage - 1) {
                                return <button key={"numBtn" + i} type="button" className={styles.curruntPageActive + ' ' + styles.pageNumbers} onClick={() => currentPageHandler(i + 1)}>
                                    {i + 1}
                                </button>
                            }
                            return <button key={"numBtn" + i} type="button" className={styles.pageNumbers} onClick={() => currentPageHandler(i + 1)}>
                                {i + 1}
                            </button>
                        }
                    } else {
                        if (i >= currentPage - 3 && i < currentPage + 2) {
                            if (i == currentPage - 1) {
                                return <button key={"numBtn" + i} type="button" className={styles.curruntPageActive + ' ' + styles.pageNumbers} onClick={() => currentPageHandler(i + 1)}>
                                    {i + 1}
                                </button>
                            }
                            return <button key={"numBtn" + i} type="button" className={styles.pageNumbers} onClick={() => currentPageHandler(i + 1)}>
                                {i + 1}
                            </button>
                        }
                    }
                })}
            </div>
            <div className={styles.nextPage}>
                <button type="button" className={styles.rightArrowIc} onClick={nextPageHandler} disabled={currentPage === totalPage}>
                    <FaChevronRight />
                </button>
            </div>
            <div className={styles.perPageBox}>
                <Dropdown value={perPage} options={dropdownOptions} className={styles.pagePerDropdown} onChange={(e) => perPageHandler(e.target.value)} />
            </div>
            <div className={styles.goToBox}>
                <span> Go to </span> 
                <InputText size={2} className={styles.jumpInput} value={pageInput} onKeyDown={(e) => onPageInputKeyDown(e)} onChange={onPageInputChange} tooltip={pageInputTooltip} tooltipOptions={{event: 'focus', position: 'left'}} />
            </div>
        </div>
    )
}

export default CustomPagination
