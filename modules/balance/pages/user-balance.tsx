import React, { useEffect } from "react";
import styled from "styled-components";
import { TYPES, useInjection } from "container";

// Components
import Header from "@/modules/balance/components/header";
import PrimaryButton from "@/modules/balance/components/primary-button";
import { AddIcon, SendIcon } from "@/static/icons";
import TableComponent from "@/modules/balance/components/table";
import BalanceController, { DoctorChartDataType, TableDataType } from "@/modules/balance/balance-controller";
import { observer } from "mobx-react";
import DoctorStatisticComponent from "@/modules/balance/components/doctor-statistic";

/**
 * This page is injectable. Do not use it without any wrapper
 */

const Page = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  
  .buttons {
    margin-top: 15px;
    display: flex;
    
    @media screen and (max-width: 768px) {
      width: 100%;
      
      .primary-button__component {
        width: 100%;
        justify-content: center;
      }
    } 
    
    .primary-button__component.primary { 
      margin-right: 10px;
    }
  }
  
  .table__component {
    margin-top: 30px;
  }
  
  .doctor-statistic__component {
    margin-top: 20px;
  }
`;


const UserBalancePage: React.FC = () => {
    const controller = useInjection<BalanceController>(TYPES.balanceController);

    useEffect(() => {
        controller.load();
    }, []);

    if (controller.isLoading) return <React.Fragment/>

    return <Page>
        <Header
            thisMonthAmount={controller.topUpLastMonth}
            thisYearAmount={controller.topUpLastYear}
            balance={controller.balanceAmount} />
        <div className="buttons">
            <PrimaryButton type="primary"> <SendIcon/> Вывести </PrimaryButton>
            <PrimaryButton type="secondary"> <AddIcon/> Пополнить </PrimaryButton>
        </div>
        <DoctorStatisticComponent
            data={controller.chart as DoctorChartDataType}
            onPeriodChanged={controller.changeChartPeriod} />
        <TableComponent
            data={controller.withdrawalsMoneyTable as TableDataType}
            onSelectPeriod={(period) => controller.changeTablePeriod(period, "withdrawals")}
            title="Выводы средств"/>
        <TableComponent
            data={controller.topUpMoneyTable as TableDataType}
            onSelectPeriod={(period) => controller.changeTablePeriod(period, "top_up")}
            title="Пополнение баланса"/>

    </Page>
}

export default observer(UserBalancePage);
