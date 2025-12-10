type PortInfo = {
  local_port: number;
  remote_port: number;
  process_name: string;
  pid: number;
  state: string;
  show_yn: boolean;
};

type PortInfoDict = {
  [process_name: string]: PortInfo[];
};
