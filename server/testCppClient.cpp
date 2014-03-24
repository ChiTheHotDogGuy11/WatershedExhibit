#include <stdio.h>
#include <iostream>
#include <netdb.h>

/* Dummy message sender
   This program attempts to set up a tcp connection with the given hostname and port number 
   and sends a dummy message to hostname:portnumber.

   @Usage: ./testCppClient hostname portnumber
   @author: Shan Huang
*/

using namespace std;

#define REMOTE_MODE
#define DIFFTHRES 0.000001

int socketfd;
bool calibrating = true;
bool messaging = false;

int setupConnection(char *hostname, char* portno){
    cout << "initializing client socket..." << endl;
    int status;
    struct addrinfo host_info;
    struct addrinfo *host_info_list;
    
    memset(&host_info, 0, sizeof host_info);
    
    host_info.ai_family = AF_UNSPEC;
    host_info.ai_socktype = SOCK_STREAM;
    
    status = getaddrinfo(hostname, portno, &host_info, &host_info_list);
    if(status != 0){
        cerr << "get address info failed" << endl;
        return -1;
    }
    socketfd = socket(host_info_list->ai_family, host_info_list->ai_socktype, host_info_list->ai_protocol);
    if(socketfd < 0){
        cerr << "can not set up socket" << endl;
        return -1;
    }
    status = connect(socketfd, host_info_list->ai_addr, host_info_list->ai_addrlen);
    if(status == -1){
        cerr << "connection error" << endl;
        return -1;
    }
    return 0;
}

void sendMessage(){
    char *msg = "yummy dummy!"; // replace this with real message
    
#ifdef REMOTE_MODE
    int bytes_sent = send(socketfd, msg, strlen(msg), 0);
    cout << "sent " << bytes_sent << "bytes";
    cout << "sent message: " << msg << endl;
#endif
	
}

int main(int argc, char ** argv){

    if(argc < 3){
        cerr << "usage: Hostname Portnumber" << endl;
        return -1;
    }

    if(setupConnection(argv[1], argv[2]) < 0){
        cerr << "cannot setup connection. hanging..." << endl;
        return -1;
    }

    sendMessage();
    close(socketfd);    

}

