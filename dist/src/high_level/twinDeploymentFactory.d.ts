import { TFClient, Deployment, MessageBusClient } from "grid3_client";
import { TwinDeployment } from "./models";
import { Network } from "../primitives/index";
declare class TwinDeploymentFactory {
    tfclient: TFClient;
    rmb: MessageBusClient;
    constructor();
    createContractAndSendToZos(deployment: Deployment, node_id: number, hash: string, publicIPs: number): Promise<any>;
    merge(twinDeployments: TwinDeployment[]): TwinDeployment[];
    handle(deployments: TwinDeployment[], network?: Network): Promise<any[]>;
}
export { TwinDeploymentFactory };