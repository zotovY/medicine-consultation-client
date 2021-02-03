import React from "react";
import styled from "styled-components";
import { TYPES, useInjection } from "container";

// Components
import Header from "@/modules/balance/components/header";
import PrimaryButton from "@/modules/balance/components/primary-button";
import { AddIcon, SendIcon } from "@/static/icons";
import TableComponent from "@/modules/balance/components/table";
import BalanceController from "@/modules/balance/balance-controller";

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
    
    .primary-button__component.primary { 
      margin-right: 10px;
    }
  }
  
  .table__component {
    margin-top: 30px;
  }
`;


const UserBalancePage: React.FC = () => {
    const controller = useInjection<BalanceController>(TYPES.balanceController);

    return <Page>
        <Header/>
        <div className="buttons">
            <PrimaryButton type="primary"> <SendIcon/> Вывести </PrimaryButton>
            <PrimaryButton type="secondary"> <AddIcon/> Пополнить </PrimaryButton>
        </div>
        <TableComponent data={controller.withdrawalsMoneyTable} onSelectPeriod={() => {}} selectedPeriod="За месяц" title="Выводы средств"/>
    </Page>
}

export default UserBalancePage;