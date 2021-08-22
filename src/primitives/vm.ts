import { Zmachine, Workload, WorkloadTypes, Mount, ZNetworkInterface, ZmachineNetwork, ComputeCapacity } from "grid3_client";

class VM {
    _createComputeCapacity(cpu: number, memory: number): ComputeCapacity {
        let compute_capacity = new ComputeCapacity();
        compute_capacity.cpu = cpu;
        compute_capacity.memory = 1024 * 1024 * 1024 * memory;
        return compute_capacity;
    }
    _createNetworkInterface(networkName: string, ip: string): ZNetworkInterface {
        let znetwork_interface = new ZNetworkInterface();
        znetwork_interface.network = networkName;
        znetwork_interface.ip = ip;
        return znetwork_interface;

    }
    _createMachineNetwork(networkName: string, ip: string, planetary: boolean, public_ip = ""): ZmachineNetwork {
        let zmachine_network = new ZmachineNetwork();
        zmachine_network.planetary = planetary;
        zmachine_network.interfaces = [this._createNetworkInterface(networkName, ip)];
        zmachine_network.public_ip = public_ip;
        return zmachine_network
    }
    create(name: string, flist: string, cpu: number, memory: number, disks: Mount[], networkName: string, ip: string, planetary: boolean, public_ip: string, entrypoint: string, env: Object, version: number = 0, metadata: string = "", description: string = ""): Workload {
        let zmachine = new Zmachine();
        zmachine.flist = flist;
        zmachine.network = this._createMachineNetwork(networkName, ip, planetary, public_ip);
        zmachine.size = 1;
        zmachine.mounts = disks;
        zmachine.entrypoint = entrypoint;
        zmachine.compute_capacity = this._createComputeCapacity(cpu, memory);
        zmachine.env = env;

        let zmachine_workload = new Workload();
        zmachine_workload.version = version || 0;
        zmachine_workload.name = name;
        zmachine_workload.type = WorkloadTypes.zmachine;
        zmachine_workload.data = zmachine;
        zmachine_workload.metadata = metadata;
        zmachine_workload.description = description;
        return zmachine_workload;

    }
}

export { VM }