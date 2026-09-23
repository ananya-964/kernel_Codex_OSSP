#include <stdio.h>
#include <unistd.h>
#include <sys/wait.h>
#include <stdlib.h>

int main()
{
    int pid[3];   // Initializing 3 child processes

    for (int i = 0; i < 3; i++)
    {
        pid[i] = fork();

        if (pid[i] == 0)   // Child process
        {
            printf("Child %d PID = %d\n", i + 1, getpid());
            sleep(i + 1);
            exit(0);
        }
    }

    wait(NULL);
    printf("Parent: One child is completed with wait()\n");

    waitpid(pid[2], NULL, 0);
    printf("Parent: Child 3 has completed with waitpid()\n");

    wait(NULL);
    printf("Parent: All the children are completed\n");

    return 0;
}
