// React Module Imports

// Next Module Imports
import type { NextPage } from 'next'

// Prime React Imports

// 3rd Party Imports

// Style and Component Imports
import { withProtectSync } from "../../utils/protect"
import DashboardLayout from '../../components/DashboardLayout';

// Interface/Helper Imports



const Product: NextPage = (props: any) => {

  return (
    <DashboardLayout sidebar={true}>
      <h1 className='p-text-center'>Product Dashboard</h1>
    </DashboardLayout>
  )
}

export default withProtectSync(Product)
