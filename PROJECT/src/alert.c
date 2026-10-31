#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/stat.h>
#include <errno.h>

#define HOSPITAL_FIFO "hospital_fifo"
#define MSG_SIZE 1024


int main()
{
    printf("====================================\n");
    printf("        DOCTOR ALERT PROCESS\n");
    printf("====================================\n");


    /*
     * Make sure FIFO exists.
     */
    if (mkfifo(HOSPITAL_FIFO, 0666) == -1)
    {
        if (errno != EEXIST)
        {
            perror("mkfifo failed");
            return 1;
        }
    }


    while (1)
    {
        printf("\n[DOCTOR ALERT PROCESS]\n");
        printf("Waiting for hospital alert...\n");


        /*
         * Open FIFO for reading.
         */
        int fifo_fd =
            open(HOSPITAL_FIFO, O_RDONLY);

        if (fifo_fd == -1)
        {
            perror("Could not open hospital_fifo");
            return 1;
        }


        char buffer[MSG_SIZE];


        ssize_t bytes =
            read(fifo_fd,
                 buffer,
                 sizeof(buffer));

        close(fifo_fd);


        if (bytes <= 0)
        {
            printf("No alert received.\n");
            continue;
        }


        /*
         * Variables to store received data.
         */
        int patient_id;
        int heart_rate;
        int systolic_bp;
        int diastolic_bp;
        int temperature;
        int oxygen_level;

        char status[20];
        char condition[150];
        char prevention[250];


        /*
         * Extract message.
         */
        int fields = sscanf(
            buffer,
            "%d|%d|%d|%d|%d|%d|%19[^|]|%149[^|]|%249[^|]",

            &patient_id,
            &heart_rate,
            &systolic_bp,
            &diastolic_bp,
            &temperature,
            &oxygen_level,

            status,
            condition,
            prevention
        );


        if (fields != 9)
        {
            printf("Invalid alert data received.\n");
            continue;
        }


        /*
         * Display Doctor Alert.
         */
        printf("\n====================================\n");
        printf("          EMERGENCY ALERT\n");
        printf("====================================\n");

        printf("Patient ID        : %d\n",
               patient_id);

        printf("Heart Rate        : %d BPM\n",
               heart_rate);

        printf("BP                : %d/%d mmHg\n",
               systolic_bp,
               diastolic_bp);

        printf("Temperature       : %d C\n",
               temperature);

        printf("Oxygen Level      : %d%%\n",
               oxygen_level);

        printf("Status            : %s\n",
               status);

        printf("Condition         : %s\n",
               condition);

        printf("Prevention        : %s\n",
               prevention);


        /*
         * Doctor action.
         */
        if (strcmp(status, "EMERGENCY") == 0)
        {
            printf("Action            : "
                   "Doctor has been notified immediately!\n");
        }
        else if (strcmp(status, "WARNING") == 0)
        {
            printf("Action            : "
                   "Patient placed under close observation.\n");
        }
        else
        {
            printf("Action            : "
                   "No action needed. Patient stable.\n");
        }


        printf("====================================\n");
    }


    return 0;
}
