// React Module Imports
import React, { useState } from 'react'
// Next Module Imports
import type { NextPage } from 'next'

// Prime React Imports
import { Dialog } from 'primereact/dialog';

// 3rd Party Imports

// Style and Component Imports
import layoutStyles from '../../styles/Home.module.scss';
import styles from '../../styles/product.module.scss';
import { withProtectSync } from "../../utils/protect"
import DashboardLayout from '../../components/DashboardLayout';

// Interface/Helper Imports


const CsvCompare: NextPage = (props: any) => {

    return (
        <DashboardLayout sidebar={false}>
            <div className={layoutStyles.topBar}>
                <div className='p-d-flex p-ai-center p-jc-between'>
                    <div>
                        <p>Tools / CSV Compare / <span>Dashboard</span></p>
                        <h5>Dashboard</h5>
                    </div>
                </div>
            </div>
            <div className={layoutStyles.box}>
                <div className={layoutStyles.headContentBox}>
                    <div className={layoutStyles.textBox}>
                        <div className={'p-d-flex p-flex-column p-flex-md-row '}>
                            <div className="">1</div>
                            <div className="">2</div>
                            <div className="">3</div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

export default withProtectSync(CsvCompare)
