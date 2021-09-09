import { TFClient, WorkloadTypes, Deployment, MessageBusClient } from "grid3_client"

import { Operations, TwinDeployment } from "./models";
import { Network, getNodeTwinId } from "../primitives/index";
import { default as config } from "../../config.json"


class TwinDeploymentFactory {
    tfclient: TFClient;
    rmb: MessageBusClient;

    constructor() {
        this.tfclient = new TFClient(config.url, config.mnemonic)
        this.rmb = new MessageBusClient();
    }

    async createContractAndSendToZos(deployment: Deployment, node_id: number, hash: string, publicIPs: number) {
        await this.tfclient.connect()
        const contract = await this.tfclient.contracts.create(node_id, hash, "", publicIPs)
        if (contract instanceof (Error)) {
            throw Error(`Failed to create contract ${contract}`)
        }
        console.log(contract)
        deployment.contract_id = contract["contract_id"]
        const payload = JSON.stringify(deployment);
        const node_twin_id = await getNodeTwinId(node_id)
        try {
            let msg = this.rmb.prepare("zos.deployment.deploy", [node_twin_id], 0, 2);
            this.rmb.send(msg, payload)
            const result = await this.rmb.read(msg)
            if (result[0].err) {
                throw Error(result[0].err);
            }
        }
        catch (err) {
            await this.tfclient.contracts.cancel(contract["contract_id"])
            throw Error(err)
        }
        finally {
            this.tfclient.disconnect()
        }
        return contract
    }

    merge(twinDeployments: TwinDeployment[]): TwinDeployment[] {
        let deploymentMap = {}
        for (let twinDeployment of twinDeployments) {
            if (twinDeployment.operation !== Operations.deploy) {
                continue
            }
            if (Object.keys(deploymentMap).includes(twinDeployment.nodeId.toString())) {
                deploymentMap[twinDeployment.nodeId].deployment.workloads = deploymentMap[twinDeployment.nodeId].deployment.workloads.concat(twinDeployment.deployment.workloads)
            }
            else {
                deploymentMap[twinDeployment.nodeId] = twinDeployment
            }
        }

        let deployments = []
        for (let key of Object.keys(deploymentMap)) {
            deployments.push(deploymentMap[key])
        }
        return deployments
    }

    async handle(deployments: TwinDeployment[], network: Network = null) {
        deployments = this.merge(deployments)
        let contracts = []
        for (let twinDeployment of deployments) {
            for (let workload of twinDeployment.deployment.workloads) {
                if (workload.type === WorkloadTypes.network) {
                    workload["data"] = network.updateNetwork(workload.data);
                }
            }
            const hash = twinDeployment.deployment.challenge_hash()
            twinDeployment.deployment.sign(config.twin_id, config.mnemonic)
            if (twinDeployment.operation === Operations.deploy) {
                const contract = await this.createContractAndSendToZos(twinDeployment.deployment,
                    twinDeployment.nodeId,
                    hash,
                    twinDeployment.publicIPs)
                if (network) {
                    await network.save(contract["contract_id"], twinDeployment.nodeId)
                }
                contracts.push(contract)
            }
        }
        return contracts
    }
}

export { TwinDeploymentFactory }