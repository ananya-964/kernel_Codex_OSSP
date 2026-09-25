uname -a → The uname command shows basic details about the Linux system and its kernel.

lscpu → The lscpu command displays CPU-related information such as architecture, number of cores, threads, and processor details.

lsblk → The lsblk command lists available block devices, including storage disks and their partitions.

ps → The ps command shows details about processes that are currently running in the system.

top → The top command continuously displays system activity, including CPU usage, memory usage, and running processes.

The Operating System (OS) works as an interface between computer hardware and application programs. It manages hardware resources and provides common services that allow applications to use the hardware safely and efficiently.

CPU Abstraction:
The OS provides an abstraction of the CPU through processes and scheduling. Applications do not directly manage the processor; instead, the OS scheduler determines which process receives CPU time.

Memory Abstraction:
The OS gives each process a virtual address space. This allows programs to use memory without needing to know where the data is physically stored in RAM.

Storage Abstraction:
The OS simplifies storage management by organizing physical storage devices into files, directories, and file systems. Applications can access data through files instead of dealing directly with disk sectors.

I/O Device Abstraction:
The OS manages hardware devices through device drivers. Applications interact with devices such as keyboards, displays, and disks through standard OS interfaces and system calls.

Conclusion:
Therefore, the OS provides a simplified and controlled interface to hardware by hiding its complexity and offering useful abstractions and services to application programs.
