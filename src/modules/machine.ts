import { BaseModule } from "./base"
import { Machines } from "./models"
import { Network } from "../primitives/index"
import { expose } from "../helpers/expose"
import { VirtualMachine } from "../high_level/machine"
import { TwinDeploymentFactory } from "../high_level/twinDeploymentFactory"


class Machine extends BaseModule {
    fileName: string = "machines.json";

    @expose
    async deploy(options: Machines) {

        if (this.exists(options.name)) {
            throw Error(`Another machine deployment with the same name ${options.name} is already exist`)
        }

        const networkName = options.network.name;
        let network = new Network(networkName, options.network.ip_range)
        await network.load(true)

        const vm = new VirtualMachine()
        let [twinDeployments, wgConfig] = await vm.create(
            options.name,
            options.node_id,
            options.flist,
            options.cpu,
            options.memory,
            options.disks,
            options.public_ip,
            network,
            options.entrypoint,
            options.env,
            options.metadata,
            options.description)

        let twinDeploymentFactory = new TwinDeploymentFactory()
        const contracts = await twinDeploymentFactory.handle(twinDeployments, network)
        const data = this.save(options.name, contracts, wgConfig)
        return data
    }

    @expose
    async get(options) {
        return await this._get(options.name)
    }

    @expose
    async delete(options) {
        return await this._delete(options.name)
    }
}

export { Machine as machine }