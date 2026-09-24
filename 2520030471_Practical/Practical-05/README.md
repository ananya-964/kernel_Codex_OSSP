Pipe Communication: -

Parent process acts as the Producer.
Child process acts as the Consumer.
An anonymous pipe is used for communication.
The parent writes data into the pipe.
The child reads data from the pipe.
Communication efficiency is measured using the time taken for data transfer.

System Calls Used: -
fork() → creates a child process.
pipe() → creates a communication channel between processes.
dup2() → connects the pipe with standard input/output.
exec() → executes commands such as ls and grep.

Data Flow: -
ls -l → Pipe → grep ".c"

The output of ls -l is sent through the pipe to grep ".c", which displays the matching .c files.
