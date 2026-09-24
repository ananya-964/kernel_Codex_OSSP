#include<unistd.h>
#include<stdio.h>
int main()
{
int pid;
pid=fork();
if(pid==0){
printf("Child Process\n");
printf("Child pid is %d\n",getpid());
}
else if(pid>0){
printf("Parent Process\n");
printf("Parent pid is %d\n",getpid());
}
else if(pid<0)
{
printf("Failed process\n");
}
}
