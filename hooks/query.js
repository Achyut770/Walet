// import axios from "axios";

// import { ROBOT_CARDS_DATA } from "@/_mock/metadata";
// import { useGlobalStates } from "@/store/useGlobalStates";
// import { formateDataOfRobots } from "@/utils/helper";
// import { useQueries, useQuery } from "@tanstack/react-query";
// import { useWeb3ModalAccount } from "@web3modal/ethers5/react";
// import { ethers } from "ethers";
// import { useRouter } from "next/router";
// import { infuraApiKey, queryKeys } from "./queryContants";

// export const useQueryGetDetails = () => {
//   const { address } = useWeb3ModalAccount();
//   const { ULTRON_GPT_CONTRACT } = useGlobalStates((state) => state.contract);
//   const queryKey = [queryKeys.getUserDeposit, address];

//   const queryFn = async () => {
//     // userBalance
//     const tx = await ULTRON_GPT_CONTRACT.userBalance(address);
//     return tx;
//   };

//   return useQuery({
//     queryKey,
//     queryFn,
//     enabled: !!address && !!ULTRON_GPT_CONTRACT,
//     select: (res) => {
//       const userInvestment = res && ethers.utils.formatEther(`${res}`);
//       return Number(userInvestment)?.toFixed(2);
//     },
//     onError: (error) => {
//       console.log(error);
//     },
//     onSuccess: (res) => {
//       console.log(res);
//     },
//   });
// };

// // const contactDetails = useGlobalStates((state) => state.contract);

// // ====================== getActivatedRobotsForUser =====================

// export const useQueryGetActivatedRobotsForUser = () => {
//   const { address } = useWeb3ModalAccount();
//   const { ULTRON_GPT_CONTRACT } = useGlobalStates((state) => state.contract);
//   const queryKey = [queryKeys.getActivatedRobotsForUser, address];

//   const queryFn = async () => {
//     // userBalance
//     const tx = await ULTRON_GPT_CONTRACT.getActivatedRobotsForUser(address);
//     return tx;
//   };

//   return useQuery({
//     queryKey,
//     queryFn,
//     enabled: !!address && !!ULTRON_GPT_CONTRACT,
//     onError: (error) => {
//       console.log(error);
//     },
//     select: (res) => {
//       const latestRobotsData = formateDataOfRobots(res, ROBOT_CARDS_DATA);
//       return latestRobotsData;
//     },
//     onSuccess: (res) => {
//       console.log(res);
//     },
//   });
// };

// // ==================================== timeTillQuantified ======================

// export const useQueryTimeTillQuantified = (robotId) => {
//   const { address } = useWeb3ModalAccount();
//   const { ULTRON_GPT_CONTRACT } = useGlobalStates((state) => state.contract);
//   const queryKey = [queryKeys.timeTillQuantified, address, robotId];

//   const queryFn = async () => {
//     // userBalance
//     const tx = await ULTRON_GPT_CONTRACT.timeTillQuantified(address, robotId);
//     return { tx, id: robotId };
//   };

//   return useQuery({
//     queryKey,
//     queryFn,
//     enabled: !!address && !!ULTRON_GPT_CONTRACT && !!robotId,
//     onError: (error) => {
//       console.log(error);
//     },
//     select: (res) => {
//       return {
//         start: res?.tx?.[0].toString(),
//         totalTime: res?.tx?.[1].toString(),
//         newTime: res?.tx?.[2].toString(),
//         id: res?.id,
//       };
//     },
//     onSuccess: (res) => {
//       console.log(res);
//     },
//   });
// };

// // ==================================== getIndividualRobotAmount =====================

// export const useQueryGetIndividualRobotAmount = () => {
//   const { address } = useWeb3ModalAccount();
//   const queryKey = [queryKeys.getIndividualRobotAmount, address];
//   const { ULTRON_GPT_CONTRACT } = useGlobalStates((state) => state.contract);

//   const queryFn = async () => {
//     // userBalance
//     const tx = await ULTRON_GPT_CONTRACT.getIndividualRobotAmount(address);
//     return tx;
//   };

//   return useQuery({
//     queryKey,
//     queryFn,
//     enabled: !!address && !!ULTRON_GPT_CONTRACT,
//     select: (res) => {
//       const userInvestment = res && ethers.utils.formatEther(`${res}`);
//       return Number(userInvestment)?.toFixed(2);
//     },
//     onError: (error) => {
//       console.log(error);
//     },
//     onSuccess: (res) => {
//       console.log(res);
//     },
//   });
// };

// // ============================================== getUserTransactionHistory ==============

// export const useQueryGetUserTransactionHistory = () => {
//   const { address } = useWeb3ModalAccount();
//   const queryKey = [queryKeys.getUserTransactionHistory, address];
//   const { ULTRON_GPT_CONTRACT } = useGlobalStates((state) => state.contract);

//   const queryFn = async () => {
//     // userBalance
//     const tx = await ULTRON_GPT_CONTRACT.getUserTransactionHistory(address);
//     return tx;
//   };

//   return useQuery({
//     queryKey,
//     queryFn,
//     enabled: !!address && !!ULTRON_GPT_CONTRACT,
//     // select:(res)=>{
//     //   const userInvestment = res && ethers.utils.formatEther(`${res}`);
//     //   return Number(userInvestment)?.toFixed(2);
//     // },
//     onError: (error) => {
//       console.log(error);
//     },
//     onSuccess: (res) => {
//       console.log(res);
//     },
//   });
// };

// // ============================= totalRobotsValue ============================

// export const useQueryTotalRobotsValue = () => {
//   const { address } = useWeb3ModalAccount();
//   const queryKey = [queryKeys.teamRobotValue, address];
//   const { ULTRON_GPT_CONTRACT } = useGlobalStates((state) => state.contract);

//   const queryFn = async () => {
//     const tx = await ULTRON_GPT_CONTRACT.teamRobotValue(address);
//     return tx;
//   };

//   return useQuery({
//     queryKey,
//     queryFn,
//     enabled: !!address && !!ULTRON_GPT_CONTRACT,
//     select: (res) => {
//       const userInvestment = res && ethers.utils.formatEther(`${res}`);
//       return Number(userInvestment)?.toFixed(0);
//     },
//     onError: (error) => {
//       console.log(error);
//     },
//     onSuccess: (res) => {
//       console.log(res);
//     },
//   });
// };

// //==================================== getRank ==========================

// export const useQueryGetRank = () => {
//   const { address } = useWeb3ModalAccount();
//   const queryKey = [queryKeys.getRank, address];
//   const { ULTRON_GPT_CONTRACT } = useGlobalStates((state) => state.contract);

//   const queryFn = async () => {
//     const tx = await ULTRON_GPT_CONTRACT.getRank(address);
//     return tx;
//   };

//   return useQuery({
//     queryKey,
//     queryFn,
//     enabled: !!address && !!ULTRON_GPT_CONTRACT,
//     // select:(res)=>{
//     //   const userInvestment = res && ethers.utils.formatEther(`${res}`);
//     //   return Number(userInvestment)?.toFixed(0);
//     // },
//     onError: (error) => {
//       console.log(error);
//     },
//     onSuccess: (res) => {
//       console.log(res);
//     },
//   });
// };

// // ========================= totalTeamMember ==============================

// export const useQueryTotalTeamMember = () => {
//   const { address } = useWeb3ModalAccount();
//   const queryKey = [queryKeys.totalTeamMember, address];
//   const { ULTRON_GPT_CONTRACT } = useGlobalStates((state) => state.contract);

//   const queryFn = async () => {
//     const tx = await ULTRON_GPT_CONTRACT.totalTeamMember(address);
//     return tx;
//   };

//   return useQuery({
//     queryKey,
//     queryFn,
//     enabled: !!address && !!ULTRON_GPT_CONTRACT,
//     select: (res) => {
//       return res.toString();
//     },
//     onError: (error) => {
//       console.log(error);
//     },
//     onSuccess: (res) => {
//       console.log(res);
//     },
//   });
// };

// // ================================== totalTeamInvestment =====================

// export const useQueryTotalTeamInvestment = () => {
//   const { address } = useWeb3ModalAccount();
//   const queryKey = [queryKeys.totalTeamInvestment, address];
//   const { ULTRON_GPT_CONTRACT } = useGlobalStates((state) => state.contract);

//   const queryFn = async () => {
//     const tx = await ULTRON_GPT_CONTRACT.totalTeamInvestment(address);
//     return tx;
//   };

//   return useQuery({
//     queryKey,
//     queryFn,
//     enabled: !!address && !!ULTRON_GPT_CONTRACT,
//     select: (res) => {
//       const investment = res && ethers.utils.formatEther(`${res}`);
//       return Number(investment)?.toFixed(0);
//     },
//     onError: (error) => {
//       console.log(error);
//     },
//     onSuccess: (res) => {
//       console.log(res);
//     },
//   });
// };

// // ================================== totalValueLocked =====================

// export const useQueryTotalValueLocked = () => {
//   const { address } = useWeb3ModalAccount();
//   const queryKey = [queryKeys.totalValueLocked, address];
//   const { ULTRON_GPT_CONTRACT } = useGlobalStates((state) => state.contract);

//   const queryFn = async () => {
//     const tx = await ULTRON_GPT_CONTRACT.totalValueLocked();
//     return tx;
//   };

//   return useQuery({
//     queryKey,
//     queryFn,
//     enabled: !!address && !!ULTRON_GPT_CONTRACT,
//     select: (res) => {
//       return res?.toString();
//     },
//     onError: (error) => {
//       console.log(error);
//     },
//     onSuccess: (res) => {
//       console.log(res);
//     },
//   });
// };

// // ================================== gettotalProfit =====================

// export const useQueryTotalProfit = () => {
//   const { address } = useWeb3ModalAccount();
//   const queryKey = [queryKeys.gettotalProfit, address];
//   const { ULTRON_GPT_CONTRACT } = useGlobalStates((state) => state.contract);

//   const queryFn = async () => {
//     const tx = await ULTRON_GPT_CONTRACT.gettotalProfit(address);
//     return tx;
//   };

//   return useQuery({
//     queryKey,
//     queryFn,
//     enabled: !!address && !!ULTRON_GPT_CONTRACT,
//     select: (res) => {
//       const investment = res && ethers.utils.formatEther(`${res}`);
//       return Number(investment)?.toFixed(0);
//     },
//     onError: (error) => {
//       console.log(error);
//     },
//     onSuccess: (res) => {
//       console.log(res);
//     },
//   });
// };

// // ================================== profitPercentage =====================

// export const useQueryProfitPercentage = () => {
//   const { address } = useWeb3ModalAccount();
//   const queryKey = [queryKeys.profitPercentage, address];
//   const { ULTRON_GPT_CONTRACT } = useGlobalStates((state) => state.contract);

//   const queryFn = async () => {
//     const tx = await ULTRON_GPT_CONTRACT.profitPercentage();
//     return tx;
//   };

//   return useQuery({
//     queryKey,
//     queryFn,
//     enabled: !!address && !!ULTRON_GPT_CONTRACT,
//     select: (res) => {
//       return Number(res)?.toFixed(0);
//     },
//     onError: (error) => {
//       console.log(error);
//     },
//     onSuccess: (res) => {
//       console.log(res);
//     },
//   });
// };

// // ================================== profitPercentage =====================

// export const useQueryGetReferralAddress = () => {
//   const { address } = useWeb3ModalAccount();
//   const router = useRouter();
//   const queryKey = [queryKeys.profitPercentage, router?.asPath];

//   const queryFn = async () => {
//     const tx = await localStorage.getItem("referralAddress");
//     return tx;
//   };

//   return useQuery({
//     queryKey,
//     queryFn,
//     onError: (error) => {
//       console.log(error);
//     },
//     onSuccess: (res) => {
//       console.log(res);
//     },
//   });
// };
