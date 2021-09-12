import { TFClient, Deployment, MessageBusClient } from "grid3_client";
import { TwinDeployment } from "./models";
import { Network } from "../primitives/index";
declare class TwinDeploymentFactory {
    tfclient: TFClient;
    rmb: MessageBusClient;
    constructor();
    deploy(deployment: Deployment, node_id: number, publicIps: number): Promise<any>;
    update(deployment: Deployment, publicIps: number): Promise<any>;
    deployMerge(twinDeployments: TwinDeployment[]): TwinDeployment[];
    _updateToLatest(twinDeployments: TwinDeployment[]): TwinDeployment;
    updateMerge(twinDeployments: TwinDeployment[]): TwinDeployment[];
    merge(twinDeployments: TwinDeployment[]): TwinDeployment[];
    handle(twinDeployments: TwinDeployment[], network?: Network): Promise<any[]>;
}
export { TwinDeploymentFactory };
