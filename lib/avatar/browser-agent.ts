export type NovaBrowserAction =
  | { type: "theme"; value: "light" | "dark" }
  | { type: "tickets"; urgent: boolean; open: boolean }
  | { type: "revenue"; period: 7 | 30 | 90 }
  | { type: "knowledge"; laptopQuestion: boolean }
  | { type: "navigate"; destination: "dashboard" | "sessions" | "settings" }
  | { type: "none" };

export function interpretBrowserCommand(raw:string):{answer:string;action:NovaBrowserAction}{
  const command=raw.toLowerCase();
  if(command.includes("dark"))return {answer:"Dark mode is on.",action:{type:"theme",value:"dark"}};
  if(command.includes("light"))return {answer:"Light mode is on.",action:{type:"theme",value:"light"}};
  if(command.includes("urgent")&&command.includes("ticket"))return {answer:"I’ve opened support and filtered it to urgent tickets that are still open.",action:{type:"tickets",urgent:true,open:true}};
  if(command.includes("ticket")||command.includes("support"))return {answer:"I’ve opened the support queue.",action:{type:"tickets",urgent:false,open:false}};
  if(command.includes("revenue")||command.includes("refund")){
    const period:7|30|90=command.includes("90")?90:command.includes("7")?7:30;
    return {answer:`I’ve opened the ${period}-day revenue view. The exact summary and largest refund are highlighted there.`,action:{type:"revenue",period}};
  }
  if(command.includes("knowledge")||command.includes("policy")||command.includes("onboarding")||command.includes("laptop")){
    const laptopQuestion=command.includes("laptop");
    return {answer:laptopQuestion?"The onboarding guide says to request the laptop before the start date, then enable MFA and install the managed device profile on day one.":"I’ve opened company knowledge.",action:{type:"knowledge",laptopQuestion}};
  }
  if(command.includes("session"))return {answer:"I’ve opened conversation history.",action:{type:"navigate",destination:"sessions"}};
  if(command.includes("setting"))return {answer:"I’ve opened settings.",action:{type:"navigate",destination:"settings"}};
  if(command.includes("dashboard")||command.includes("home"))return {answer:"I’ve returned to the operations overview.",action:{type:"navigate",destination:"dashboard"}};
  return {answer:"I can help with revenue, refunds, support tickets, company knowledge, session history, navigation, or theme settings.",action:{type:"none"}};
}
