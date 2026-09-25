uname -a → Shows basic information about the Linux system and kernel.

lscpu → Shows CPU details such as architecture, cores, and threads.

lsblk → Shows storage devices like disks and their partitions.

ps → Shows the processes currently running on the system.

top → Shows live system information such as CPU usage, memory usage, and processes.


The Operating System (OS) acts as a link between the hardware and application programs. It manages the hardware and provides useful services to applications.

CPU Abstraction:
The OS manages the CPU using processes and scheduling. It decides which process gets CPU time.

Memory Abstraction:
The OS gives each process its own virtual memory space. Programs do not need to know the actual location of data in RAM.

Storage Abstraction:
The OS manages storage using files, folders, and file systems. Programs can work with files without directly handling the disk.

I/O Device Abstraction:
The OS manages devices such as keyboards, screens, and disks using device drivers. Programs can use these devices through system calls.

Conclusion:
The OS makes hardware easier and safer to use by hiding its complex details and providing simple services to applications.
