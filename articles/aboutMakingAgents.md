# 关于手搓简易agent

其实`AI Agent`没大家吹得那么神……想写一个能跑的`Agent`还是很容易的

## 定义

首先我们要明确，什么叫`AI Agent`

理论上说，能调用工具`AI`的就是`Agent`

明确定义以后，我们就可以开始动工了

## 工具

应该如何让`AI`调用工具呢，我们知道，`AI`只能输出文本

这就不得不提`Re·Act`架构了

它的主要思想是，让模型先思考，然后调用工具

具体就是让模型输出特定的`json`然后由程序解析

这样就很简单了，我们只需要在`system prompt`里写好工具调用的格式就好了

## AI源

可以尝试`Ollama`，直接本地运行，~~然而本地8b模型很笨，所以有条件还是接API吧~~

## Code

代码不长，就几百行

实际上仔细看可以发现很多代码是堆叠的，核心只有一个`while`

好久前写的古早代码了，有的地方偷懒和bug别骂我QAQ

```cpp
#include <iostream>
#include <string>
#include <vector>
#include <fstream>
#define WIN32_LEAN_AND_MEAN
#define JSON_USE_WSTRING
#include <winsock2.h>
#include <windows.h>
#include <fcntl.h>
#include <io.h>
#include "include/ollama.hpp"
#define ColorText(a) SetConsoleTextAttribute(hConsole,(a))
using json=nlohmann::json;
HANDLE hConsole=GetStdHandle(STD_OUTPUT_HANDLE);
std::string runExeReq;
std::string wstring_to_utf8(const std::wstring& wstr){
    if(wstr.empty()) return {};
    int size_needed=WideCharToMultiByte(CP_UTF8,0,wstr.c_str(),(int)wstr.size(),NULL,0,NULL,NULL);
    std::string utf8str(size_needed,0);
    WideCharToMultiByte(CP_UTF8,0,wstr.c_str(),(int)wstr.size(),&utf8str[0],size_needed,NULL,NULL);
    return utf8str;
}
struct ColorConfig{
    int info=7;
    int success=10;
    int warning=14;
    int error=12;
    int ai_response=11;
    int user_input=12;
    int background=0;
    int reset=7;
    bool loadFromFile(const std::wstring& filename){
        std::ifstream file(filename.c_str(),std::ios::binary);
        if(!file.is_open()){
            return false;
        }
        try{
            json config=json::parse(file);
            if(config.contains("colors")){
                auto& colors=config["colors"];
                if(colors.contains("info")) info=colors["info"];
                if(colors.contains("success")) success=colors["success"];
                if(colors.contains("warning")) warning=colors["warning"];
                if(colors.contains("error")) error=colors["error"];
                if(colors.contains("ai_response")) ai_response=colors["ai_response"];
                if(colors.contains("user_input")) user_input=colors["user_input"];
            }
            if(config.contains("background")) background=config["background"];
            if(config.contains("reset")) reset=config["reset"];
        }catch(const json::exception& e){
            std::cerr<<"failed to parse color config:"<<e.what()<<"\n";
        }
        return true;
    }
};
ColorConfig cc;
std::wstring utf8_to_wstring(const std::string& utf8str){
    if(utf8str.empty()) return std::wstring();
    int size_needed=MultiByteToWideChar(CP_UTF8,0,utf8str.c_str(),(int)utf8str.size(),NULL,0);
    std::wstring wstr(size_needed,0);
    MultiByteToWideChar(CP_UTF8,0,utf8str.c_str(),(int)utf8str.size(),&wstr[0],size_needed);
    return wstr;
}
void printHelp(){
    std::cout<<"Usage:z-star-agent <parameters>"<<std::endl
              <<"Parameters(parameter with a star is a must-use parameter):"<<std::endl
              <<" --help: Show this list"<<std::endl
              <<"*--model: Model to use,e.g.,z-star-agent --model gemma3:4b,this could change during one run"<<std::endl
              <<" --test: Test if ollama running"<<std::endl;
}
std::wstring extractJsonFromMarkdown(const std::wstring& text) {
    size_t start=text.find(L"```json");
    if(start==std::wstring::npos){
        return text;
    }
    start=text.find(L'\n',start);
    if(start==std::wstring::npos) return text;
    start++;
    size_t end=text.rfind(L"```");
    if(end==std::wstring::npos){
        return text.substr(start);
    }
    return text.substr(start,end-start);
}
std::wstring readConsoleLine() {
    HANDLE hStdin=GetStdHandle(STD_INPUT_HANDLE);
    wchar_t buffer[4096];
    DWORD charsRead=0;
    if(!ReadConsoleW(hStdin,buffer,4096,&charsRead,nullptr)){
        return L"";
    }
    if(charsRead>=2&&buffer[charsRead-2]==L'\r'&&buffer[charsRead-1]==L'\n'){
        charsRead-=2;
    }
    else if(charsRead>=1&&(buffer[charsRead-1]==L'\n'||buffer[charsRead-1]==L'\r')){
        charsRead-=1;
    }
    return std::wstring(buffer,charsRead);
}
std::wstring readFile(std::wstring path){
    std::ifstream in(path.c_str(),std::ios::binary);
    if(!in.is_open()){
        ColorText(cc.error);
        std::cout<<"Error:Cannot read file."<<std::endl;
        ColorText(cc.reset);
        return utf8_to_wstring(json{{L"error",L"Cannot open the file"}}.dump(-1,' ',false));
    }
    std::string res="";
    std::string buf;
    while(std::getline(in,buf)){
        res+=buf+"\n";
    }
    in.close();
    ColorText(cc.success);
    std::cout<<"Succesfully read file "<<wstring_to_utf8(path)<<" ."<<std::endl;
    ColorText(cc.reset);
    return utf8_to_wstring(json{{"content",res}}.dump(-1,' ',false));
}
std::wstring appendFile(std::wstring path,std::wstring content){
    if(path.find(L"TOOL.md")!=std::wstring::npos){
        return utf8_to_wstring(json{{L"error",L"The file TOOL.md is forbiddened to append"}}.dump(-1,' ',false));
    }
    if(path.find(L"SOUL.md")!=std::wstring::npos){
        return utf8_to_wstring(json{{L"error",L"The file SOUL.md is forbiddened to append"}}.dump(-1,' ',false));
    }
    std::ofstream out(path.c_str(),std::ios::app|std::ios::binary);
    if(!out.is_open()){
        ColorText(cc.error);
        std::cout<<"Error:Cannot append file."<<std::endl;
        ColorText(cc.reset);
        return utf8_to_wstring(json{{L"error",L"Cannot open the file"}}.dump(-1,' ',false));
    }
    out<<wstring_to_utf8(content);
    out.close();
    ColorText(cc.success);
    std::cout<<"Succesfully appended file "<<wstring_to_utf8(path)<<" ."<<std::endl;
    ColorText(cc.reset);
    if(path.find(L"MEMORY.md")!=std::wstring::npos){
        return utf8_to_wstring(json{{L"warning",L"MEMORY.md is only allowed to append when the user asks,this is just a reminder"}}.dump(-1,' ',false));
    }
    return utf8_to_wstring(json{{L"append-done",true},{L"extra-remind",L"The content is succesfully appended into the file,please don't write the same thing again"}}.dump(-1,' ',false));
}
bool CreateDirectoryRecursive(const std::wstring& path){
    std::wstring dir=path;
    while(!dir.empty()&&(dir.back()=='\\'||dir.back()=='/')&&dir.size()>3){
        dir.pop_back();
    }
    if(CreateDirectoryW(dir.c_str(),NULL)){
        return true;
    }
    DWORD err=GetLastError();
    if(err==ERROR_ALREADY_EXISTS){
        return false;
    }
    else if(err==ERROR_PATH_NOT_FOUND){
        size_t pos=dir.find_last_of(L"\\/");
        if(pos==std::wstring::npos){
            return false;
        }
        std::wstring parent=dir.substr(0,pos);
        if(!CreateDirectoryRecursive(parent)){
            return false;
        }
        return CreateDirectoryW(dir.c_str(),NULL)!=0;
    }
    return false;
}

std::wstring makeFolder(std::wstring path){
    if(path.find(L"C:")!=std::wstring::npos||path.find(L"c:")!=std::wstring::npos){
        ColorText(cc.error);
        std::cout<<"Error: Cannot make new folder in C disk"<<std::endl;
        ColorText(cc.reset);
        return utf8_to_wstring(json{{L"error",L"The C disk is forbiddened to execute."}}.dump(-1,' ',false));
    }
    if(CreateDirectoryRecursive(path)){
        ColorText(cc.success);
        std::cout<<"Successfully made folder "<<wstring_to_utf8(path)<<" ."<<std::endl;
        ColorText(cc.reset);
        return utf8_to_wstring(json{{L"message",L"Folder created successfully"}}.dump(-1,' ',false));
    }
    else{
        DWORD err=GetLastError();
        LPWSTR messageBuffer=nullptr;
        FormatMessageW(
            FORMAT_MESSAGE_ALLOCATE_BUFFER|FORMAT_MESSAGE_FROM_SYSTEM|FORMAT_MESSAGE_IGNORE_INSERTS,
            NULL,err,
            MAKELANGID(LANG_NEUTRAL,SUBLANG_DEFAULT),
            (LPWSTR)&messageBuffer,0,NULL
        );
        std::wstring errorMsg=messageBuffer?messageBuffer:L"Unknown error";
        LocalFree(messageBuffer);
        ColorText(cc.error);
        std::cout<<"Error: Failed to create folder. "<<wstring_to_utf8(errorMsg)<<std::endl;
        ColorText(cc.reset);
        return utf8_to_wstring(json{{L"error",L"Failed to create folder: "+errorMsg}}.dump(-1,' ',false));
    }
}
std::wstring deleteFile(const std::wstring& filePath) {
    if(filePath.find(L"C:")!=std::wstring::npos||filePath.find(L"c:")!=std::wstring::npos){
        ColorText(cc.error);
        std::cout<<"Error: Cannot delete file in C disk"<<std::endl;
        ColorText(cc.reset);
        return utf8_to_wstring(json{{L"error",L"The C disk is forbiddened to execute."}}.dump(-1,' ',false));
    }
    if(DeleteFileW(filePath.c_str())){
        ColorText(cc.success);
        std::cout<<"Successfully deleted file: "<<wstring_to_utf8(filePath)<<std::endl;
        ColorText(cc.reset);
        return utf8_to_wstring(json{{L"message",L"File deleted successfully"}}.dump(-1,' ',false));
    }
    else{
        DWORD err=GetLastError();
        LPWSTR messageBuffer=nullptr;
        FormatMessageW(
            FORMAT_MESSAGE_ALLOCATE_BUFFER|FORMAT_MESSAGE_FROM_SYSTEM|FORMAT_MESSAGE_IGNORE_INSERTS,
            NULL,err,
            MAKELANGID(LANG_NEUTRAL,SUBLANG_DEFAULT),
            (LPWSTR)&messageBuffer,0,NULL
        );
        std::wstring errorMsg=messageBuffer?messageBuffer:L"Unknown error";
        LocalFree(messageBuffer);
        ColorText(cc.error);
        std::cout<<"Error: Failed to delete file. "<<wstring_to_utf8(errorMsg)<<std::endl;
        ColorText(cc.reset);
        return utf8_to_wstring(json{{L"error",L"Failed to delete file: "+errorMsg}}.dump(-1,' ',false));
    }
}
std::wstring listDirectory(const std::wstring& path){
    if(path.find(L"C:")!=std::wstring::npos||path.find(L"c:")!=std::wstring::npos){
        ColorText(cc.error);
        std::cout<<"Error: Cannot list directory in C disk"<<std::endl;
        ColorText(cc.reset);
        return utf8_to_wstring(json{{L"error",L"The C disk is forbiddened to execute."}}.dump(-1,' ',false));
    }
    std::wstring searchPath=path;
    if(!searchPath.empty()&&searchPath.back()!='\\'&&searchPath.back()!='/'){
        searchPath+=L"\\";
    }
    searchPath+=L"*";
    WIN32_FIND_DATAW findData;
    HANDLE hFind=FindFirstFileW(searchPath.c_str(),&findData);
    if(hFind==INVALID_HANDLE_VALUE){
        DWORD err=GetLastError();
        LPWSTR messageBuffer=nullptr;
        FormatMessageW(
            FORMAT_MESSAGE_ALLOCATE_BUFFER|FORMAT_MESSAGE_FROM_SYSTEM|FORMAT_MESSAGE_IGNORE_INSERTS,
            NULL,err,
            MAKELANGID(LANG_NEUTRAL,SUBLANG_DEFAULT),
            (LPWSTR)&messageBuffer,0,NULL
        );
        std::wstring errorMsg=messageBuffer?messageBuffer:L"Unknown error";
        LocalFree(messageBuffer);
        ColorText(cc.error);
        std::cout<<"Error: Failed to open directory. "<<wstring_to_utf8(errorMsg)<<std::endl;
        ColorText(cc.reset);
        return utf8_to_wstring(json{{L"error",L"Failed to list directory: "+errorMsg}}.dump(-1,' ',false));
    }
    std::vector<std::string> files;
    std::vector<std::string> folders;
    do{
        if(wcscmp(findData.cFileName,L".")==0||wcscmp(findData.cFileName,L"..")==0){
            continue;
        }
        if(findData.dwFileAttributes&FILE_ATTRIBUTE_DIRECTORY){
            folders.push_back(wstring_to_utf8(findData.cFileName));
        } else{
            files.push_back((wstring_to_utf8(findData.cFileName)));
        }
    }while(FindNextFileW(hFind,&findData)!=0);
    DWORD err=GetLastError();
    if(err!=ERROR_NO_MORE_FILES){
        FindClose(hFind);
        LPWSTR messageBuffer=nullptr;
        FormatMessageW(
            FORMAT_MESSAGE_ALLOCATE_BUFFER|FORMAT_MESSAGE_FROM_SYSTEM|FORMAT_MESSAGE_IGNORE_INSERTS,
            NULL,err,
            MAKELANGID(LANG_NEUTRAL,SUBLANG_DEFAULT),
            (LPWSTR)&messageBuffer,0,NULL
        );
        std::wstring errorMsg=messageBuffer?messageBuffer:L"Unknown error";
        LocalFree(messageBuffer);
        ColorText(cc.error);
        std::cout<<"Error: Failed to read directory. "<<wstring_to_utf8(errorMsg)<<std::endl;
        ColorText(cc.reset);
        return utf8_to_wstring(json{{L"error",L"Failed to list directory: "+errorMsg}}.dump(-1,' ',false));
    }
    FindClose(hFind);
    json result;
    result["files"]=files;
    result["folders"]=folders;
    ColorText(cc.success);
    std::cout<<"Successfully listed directory: "<<wstring_to_utf8(path)<<std::endl;
    ColorText(cc.reset);
    return utf8_to_wstring(result.dump(-1,' ',false));
}
std::wstring moveFile(const std::wstring& existingPath,const std::wstring& newPath){
    if(existingPath.find(L"C:")!=std::wstring::npos||existingPath.find(L"c:")!=std::wstring::npos||
        newPath.find(L"C:")!=std::wstring::npos||newPath.find(L"c:")!=std::wstring::npos){
        ColorText(cc.error);
        std::cout<<"Error: Cannot move files to/from C disk"<<std::endl;
        ColorText(cc.reset);
        return utf8_to_wstring(json{{L"error",L"The C disk operation is forbidden."}}.dump(-1,' ',false,json::error_handler_t::replace));
    }
    BOOL result=MoveFileExW(
        existingPath.c_str(),
        newPath.c_str(),
        MOVEFILE_COPY_ALLOWED|MOVEFILE_REPLACE_EXISTING
    );
    if(result){
        ColorText(cc.success);
        std::cout<<"Successfully moved/renamed: "<<wstring_to_utf8(existingPath)<<" to "<<wstring_to_utf8(newPath)<<std::endl;
        ColorText(cc.reset);
        return utf8_to_wstring(json{{L"message",L"File moved successfully"}}.dump(-1,' ',false,json::error_handler_t::replace));
    }
    else{
        DWORD err=GetLastError();
        LPWSTR messageBuffer=nullptr;
        FormatMessageW(
            FORMAT_MESSAGE_ALLOCATE_BUFFER|FORMAT_MESSAGE_FROM_SYSTEM|FORMAT_MESSAGE_IGNORE_INSERTS,
            NULL,err,
            MAKELANGID(LANG_NEUTRAL,SUBLANG_DEFAULT),
            (LPWSTR)&messageBuffer,0,NULL
        );
        std::wstring errorMsg=messageBuffer?messageBuffer:L"Unknown error";
        LocalFree(messageBuffer);
        ColorText(cc.error);
        std::cout<<"Error: Failed to move file. "<<wstring_to_utf8(errorMsg)<<std::endl;
        ColorText(cc.reset);
        return utf8_to_wstring(json{{L"error",L"Failed to move file: "+errorMsg}}.dump(-1,' ',false,json::error_handler_t::replace));
    }
}
bool saveReplaceRequest(const std::wstring& targetPath,int startLine,int endLine,const std::wstring& newContent) {
    json request;
    request["path"]=targetPath;
    request["startLine"]=startLine;
    request["endLine"]=endLine;
    request["content"]=newContent;
    std::ofstream out(L"./replace_request/REPLACE.json",std::ios::binary);
    if(!out) return false;
    std::string utf8dump=request.dump(-1,' ',false,json::error_handler_t::strict);
    out.write(utf8dump.data(),utf8dump.size());
    return true;
}
bool loadReplaceRequest(std::wstring& targetPath,int& startLine,int& endLine,std::wstring& newContent) {
    std::ifstream in("./replace_request/REPLACE.json",std::ios::binary);
    if(!in.is_open()) return false;
    std::string content((std::istreambuf_iterator<char>(in)),std::istreambuf_iterator<char>());
    try{
        json j=json::parse(content);
        if(j.contains("path")&&j["path"].is_array()&&
            j.contains("startLine")&&j["startLine"].is_number()&&
            j.contains("endLine")&&j["endLine"].is_number()&&
            j.contains("content")&&j["content"].is_array()){
            targetPath=j["path"].get<std::wstring>();
            startLine=j["startLine"].get<int>();
            endLine=j["endLine"].get<int>();
            newContent=j["content"].get<std::wstring>();
            return true;
        }
    }catch(...){}
    return false;
}
bool removeReplaceRequest(){
    return DeleteFileW((LPCWSTR)L"./replace_request/REPLACE.json")!=0;
}
std::wstring getTime(){
    auto now=std::chrono::system_clock::now();
    std::time_t now_time=std::chrono::system_clock::to_time_t(now);
    std::stringstream ss;
    ss<<std::put_time(std::localtime(&now_time),"%Y-%m-%d %H:%M:%S");
    std::string str=ss.str();
    ColorText(cc.success);
    std::cout<<"Successfully got system time."<<std::endl;
    ColorText(cc.reset);
    return utf8_to_wstring(json{{"time",str}}.dump(-1,' ',false,json::error_handler_t::replace));
}
std::wstring stageReplace(const std::wstring& targetPath,int startLine,int endLine,const std::wstring& newContent){
    if(targetPath.find(L"C:")!=std::wstring::npos||targetPath.find(L"c:")!=std::wstring::npos){
        return utf8_to_wstring(json{{"error","C disk is forbidden"}}.dump(-1,' ',false,json::error_handler_t::replace));
    }
    if(targetPath.find(L"TOOL.md")!=std::wstring::npos||
        targetPath.find(L"SOUL.md")!=std::wstring::npos) {
        return utf8_to_wstring(json{{"error","This file is protected"}}.dump(-1,' ',false,json::error_handler_t::replace));
    }
    if(startLine<=0||endLine<startLine) {
        return utf8_to_wstring(json{{"error","Invalid line range"}}.dump(-1,' ',false,json::error_handler_t::replace));
    }
    if(!saveReplaceRequest(targetPath,startLine,endLine,newContent)){
        return utf8_to_wstring(json{{"error","Failed to write ../replace_request/REPLACE.json"}}.dump(-1,' ',false,json::error_handler_t::replace));
    }
    ColorText(8);
    std::cout<<"Content to replace:"<<std::endl;
    ColorText(4);
    std::ifstream in(targetPath.c_str(),std::ios::binary);
    std::string line;
    int num=endLine-startLine+1;
    while(--startLine){
        std::getline(in,line);
    }
    while(num--){
        std::getline(in,line);
        std::cout<<line<<std::endl;
    }
    ColorText(8);
    std::cout<<"New contents"<<std::endl;
    ColorText(6);
    std::cout<<wstring_to_utf8(newContent)<<std::endl;
    ColorText(cc.success);
    std::wcout<<L"Replacement staged. Use /apply to confirm,or /cancel to abort."<<std::endl;
    ColorText(cc.reset);
    return utf8_to_wstring(json{{"message","Replacement staged. Awaiting user confirmation."}}.dump(-1,' ',false,json::error_handler_t::replace));
}
std::wstring runExe(std::wstring path){
    std::string str=wstring_to_utf8(path);
    runExeReq=str;
    ColorText(cc.success);
    std::cout<<"Requested running "<<str<<" ."<<std::endl;
    ColorText(cc.reset);
    return utf8_to_wstring(json{{"message","successfully ran an executable,awaiting user confirmation"}}.dump(-1,' ',false,json::error_handler_t::replace));
}
int wmain(int argc,wchar_t* argv[]){
    std::wstring assistantName;
    std::wstring userName;
    std::ifstream file("config.json");
    if(!file.is_open()){
        assistantName=L"Assistant";
        userName=L"User";
    }
    else{
        json config=json::parse(file);
        if(config.contains("assistant_name")){
            assistantName=utf8_to_wstring(config.at("assistant_name").get<std::string>());
        }
        if(config.contains("user_name")){
            userName=utf8_to_wstring(config.at("user_name").get<std::string>());
        }
    }
    SetConsoleOutputCP(CP_UTF8);
    SetConsoleCP(CP_UTF8);
    cc.loadFromFile(L"config.json");
    if(argc<=1) {printHelp();return 0;}
    std::vector<std::wstring> parameters;
    for(int idx=1;idx<argc;idx++){
        parameters.push_back(argv[idx]);
    }
    bool modelFlag=false;
    bool testFlag=false;
    std::wstring model=L"";
    std::ifstream in("./prompt.md");
    std::wstring res=L"";
    std::string buf;
    while(std::getline(in,buf)){
        res+=utf8_to_wstring(buf+"\n");
    }
    in.close();
    std::wstring system_prompt=res;
    std::ifstream soulin("./SOUL.md");
    res=L"\n\n";
    while(std::getline(soulin,buf)){
        res+=utf8_to_wstring(buf+"\n");
    }
    soulin.close();
    system_prompt+=res;
    std::ifstream toolin("./TOOL.md");
    res=L"\n\n";
    while(std::getline(toolin,buf)){
        res+=utf8_to_wstring(buf+"\n");
    }
    toolin.close();
    system_prompt+=res;
    std::ifstream memoryin("./MEMORY.md");
    res=L"\n\n";
    while(std::getline(memoryin,buf)){
        res+=utf8_to_wstring(buf+"\n");
    }
    memoryin.close();
    system_prompt+=res;
    ollama::messages history;
    history.push_back({"system",wstring_to_utf8(system_prompt)});
    for(size_t idx=0;idx<parameters.size();idx++){
        std::wstring parameter=parameters[idx];
        if(parameter==L"--help"){
            printHelp();
            return 0;
        }
        else if(parameter==L"--model"){
            if(idx+1>=parameters.size()||parameters[++idx][0]=='-'){
                std::cout<<"There must be a model name after --model"<<std::endl;
                return 1;
            }
            model=parameters[idx];
            modelFlag=true;
        }
        else if(parameter==L"--test"){
            testFlag=true;
        }
        else{
            std::cout<<"Unknown parameter:"<<wstring_to_utf8(parameters[idx])<<std::endl;
            return 1;
        }
    }
    if(!modelFlag){
        std::cout<<"You haven't select a model yet!"<<std::endl;
        return 1;
    }
    if(testFlag){
        std::cout<<"Testing ollama..."<<std::endl;
        if(!ollama::is_running()){
            ColorText(cc.error);
            std::cout<<"Ollama is not running now"<<std::endl;
            ColorText(cc.reset);
            return 1;
        }
        ColorText(cc.success);
        std::cout<<"Ollama is running..."<<std::endl;
        ColorText(cc.reset);
        std::cout<<"Saying hello to the model..."<<std::endl;
        std::cout<<"Testing if the model can use tools..."<<std::endl;
        history.push_back({"user","Hello!Could you please tell me what does the file `test.txt` says?"});
        try{
            ollama::request req(wstring_to_utf8(model),history);
            ollama::response Res=ollama::chat(req);
            std::wcout<<L"AI response:"<<utf8_to_wstring(Res.as_simple_string())<<std::endl;
            std::string toolCall=Res.as_simple_string();
            std::string file;
            if(toolCall.find("read-file")!=std::wstring::npos){
                file=toolCall.substr(toolCall.find("[")+2,toolCall.find("]")-toolCall.find("[")-3);
                ColorText(cc.success);
                std::wcout<<L"The model tried to call file "<<utf8_to_wstring(file)<<L"."<<std::endl;
                ColorText(cc.reset);
            }
            history.push_back({"assistant",toolCall});
            std::wstring toolRes=readFile(utf8_to_wstring(file));
            std::wcout<<L"toolResult:"<<toolRes<<std::endl;
            history.push_back({"user",wstring_to_utf8(toolRes)});
            ollama::request req1=ollama::request(wstring_to_utf8(model),history);
            ollama::response res1=ollama::chat(req1);
            std::wcout<<L"AI response:"<<utf8_to_wstring(res1.as_simple_string())<<std::endl;
        }catch(const ollama::exception& e){
            ColorText(cc.error);
            std::wcout<<L"Generate error:"<<utf8_to_wstring(e.what())<<std::endl;
            ColorText(cc.reset);
            return 1;
        }
        ColorText(cc.success);
        std::cout<<"Great!The ollama is ready now."<<std::endl;
        ColorText(cc.reset);
        return 0;
    }
    ollama::setConnectionTimeout(16384);
    ollama::setReadTimeout(32768);
    ollama::setWriteTimeout(32768);
    ColorText(3);
    std::cout<<"-----------------------------------------------------------------------------------------------------"<<std::endl
             <<"    ________ ________ ________ ________ ________     ________ ________ ________ __     _ ________    "<<std::endl
             <<"   |______  |  ______|__    __|  ____  |  ____  |   |  ____  |   _____|   _____|  |_  | |__    __|   "<<std::endl;
    ColorText(11);
    std::cout<<"      __|  _|        |  |  |  | |____| | |____| |   | |____| |  | ____|  |_____|    |_| |  |  |      "<<std::endl
             <<"    _| ___| |------  |  |  |  |  ____  |  ____  |   |  ____  |  ||__  |   _____| ||_  | |  |  |      "<<std::endl;
    ColorText(7);
    std::cout<<"   |________|________|  |__|  |_|    |_|_|    \\_\\   |_|    |_|________|________|_|  |___|  |__|      "<<std::endl
             <<"-----------------------------------------------------------------------------------------------------"<<std::endl;
    ColorText(8);
    std::cout<<"欢迎回来，"<<wstring_to_utf8(userName)<<"！今天能为你做些什么？"<<std::endl;
    std::cout<<"◆ 键入";ColorText(5);std::cout<<" /help ";ColorText(8);std::cout<<"获取命令"<<std::endl;
    std::cout<<"◆ 键入";ColorText(5);std::cout<<" /model ";ColorText(8);std::cout<<"切换模型"<<std::endl;
    std::cout<<"◆ 键入";ColorText(5);std::cout<<" /quit ";ColorText(8);std::cout<<"退出"<<std::endl;
    std::cout<<"-----------------------------------------------------------------------------------------------------"<<std::endl;
    bool usedTool=false;
    while(true){
        if(!usedTool){
            ColorText(8);
            std::cout<<">>> ";
            std::cout.flush();
            ColorText(cc.user_input);
            std::cout<<wstring_to_utf8(userName)<<":";
            std::cout.flush();
            ColorText(cc.reset);
            std::wstring p;
            p=readConsoleLine();
            if(p==L"/exit"||p==L"/quit"||p==L"/q"){
                return 0;
            }
            else if(p==L"/flush"||p==L"/back"){
                ColorText(6);
                std::cout<<"Flushed to last message."<<std::endl;
                ColorText(cc.reset);
                while(history.back().at("role")!="user"){
                    history.pop_back();
                }
            }
            else if(p.find(L"/model")!=std::wstring::npos){
                model=p.substr(7);
                ColorText(6);
                std::cout<<"Changed model to "<<wstring_to_utf8(model)<<" ."<<std::endl;
                ColorText(cc.reset);
                continue;
            }
            else if(p.find(L"/help")!=std::wstring::npos){
                std::cout<<"◆ /exit | /quit | /q:退出，未命令模型记忆的上下文将会丢失"<<std::endl;
                std::cout<<"◆ /flush | /back:刷新上一轮对话，使模型重新响应"<<std::endl;
                std::cout<<"◆ /model <model>:切换模型至<model>，若模型不存在则可能崩溃"<<std::endl;
                std::cout<<"◆ /apply:接受运行/替换请求"<<std::endl;
                std::cout<<"◆ /cancel:拒绝运行/替换请求"<<std::endl;
                continue;
            }
            else if(p==L"/apply"){
                if(!runExeReq.empty()){
                    ColorText(6);
                    std::cout<<"Trying to run "<<runExeReq<<std::endl;
                    ColorText(cc.reset);
                    system(("\""+runExeReq+"\"").c_str());
                    runExeReq.clear();
                    continue;
                }
                std::wstring targetPath,newContent;
                int startLine,endLine;
                if(!loadReplaceRequest(targetPath,startLine,endLine,newContent)) {
                    std::cout<<"No pending replacement request found."<<std::endl;
                    continue;
                }
                std::ifstream inFile(targetPath.c_str(),std::ios::binary);
                if(!inFile.is_open()){
                    std::cout<<"Failed to open target file for reading."<<std::endl;
                    continue;
                }
                std::vector<std::string> lines;
                std::string line;
                while (std::getline(inFile,line)){
                    lines.push_back(line);
                }
                inFile.close();
                if(startLine < 1||endLine > static_cast<int>(lines.size())||startLine > endLine){
                    std::cout<<"Invalid line range. File has "<<lines.size()<<" lines."<<std::endl;
                    continue;
                }
                std::wstring backupPath=targetPath + L".bak";
                if(!CopyFileW(targetPath.c_str(),backupPath.c_str(),FALSE)){
                    std::cout<<"Failed to create backup,aborting."<<std::endl;
                    continue;
                }
                std::string utf8NewContent=wstring_to_utf8(newContent);
                std::istringstream newIss(utf8NewContent);
                std::vector<std::string> newLines;
                std::string newLine;
                while(std::getline(newIss,newLine)){
                    newLines.push_back(newLine);
                }
                std::vector<std::string> newFileLines;
                for(int i=0;i<startLine-1;++i){
                    newFileLines.push_back(lines[i]);
                }
                for(const auto& l:newLines){
                    newFileLines.push_back(l);
                }
                for(size_t i=endLine;i<lines.size();++i){
                    newFileLines.push_back(lines[i]);
                }
                std::ofstream outFile(targetPath.c_str(),std::ios::binary|std::ios::trunc);
                if(!outFile){
                    std::cout<<"Failed to open target file for writing."<<std::endl;
                    continue;
                }
                for(size_t i=0;i<newFileLines.size();++i){
                    outFile<<newFileLines[i];
                    if(i!=newFileLines.size()-1) outFile<<'\n';
                }
                outFile.close();
                removeReplaceRequest();
                std::cout<<"File lines replaced successfully. Backup saved as "<<wstring_to_utf8(backupPath)<<std::endl;
                continue;
            }
            else if(p==L"/cancel"){
                if(!runExeReq.empty()){
                    runExeReq.clear();
                    continue;
                }
                if(removeReplaceRequest()){
                    std::cout<<"Replacement cancelled."<<std::endl;
                }
                else{
                    std::cout<<"No pending replacement found."<<std::endl;
                }
                continue;
            }
            else{
                history.push_back({"user",wstring_to_utf8(p)});
            }
        }
        ColorText(8);
        std::cout<<">>> ";
        std::cout.flush();
        ColorText(cc.reset);
        ollama::request req(wstring_to_utf8(model),history);
        ollama::response res=ollama::chat(req);
        std::wstring resp=utf8_to_wstring(res.as_simple_string());
        history.push_back({"assistant",wstring_to_utf8(resp)});
        resp=extractJsonFromMarkdown(resp);
        usedTool=false;
        if(json::accept(wstring_to_utf8(resp))){
            ColorText(5);
            std::cout<<"Tool:";
            std::cout.flush();
            ColorText(cc.reset);
            json j=json::parse(wstring_to_utf8(resp));
            std::wstring toolCall;
            std::vector<std::string> toolParameters;
            if(j.contains("tool")) toolCall=utf8_to_wstring(j["tool"].get<std::string>());
            if(j.contains("parameter")) toolParameters=j["parameter"].get<std::vector<std::string>>();
            std::wstring toolResponse;
            if(toolCall==L"read-file"){
                toolResponse=readFile(utf8_to_wstring(toolParameters.at(0)));
            }
            if(toolCall==L"append-file"){
                toolResponse=appendFile(utf8_to_wstring(toolParameters.at(0)),utf8_to_wstring(toolParameters.at(1)));
            }
            if(toolCall==L"make-folder"){
                toolResponse=makeFolder(utf8_to_wstring(toolParameters.at(0)));
            }
            if(toolCall==L"delete-file"){
                toolResponse=deleteFile(utf8_to_wstring(toolParameters.at(0)));
            }
            if(toolCall==L"list-directory"){
                toolResponse=listDirectory(utf8_to_wstring(toolParameters.at(0)));
            }
            if(toolCall==L"move-file"){
                toolResponse=moveFile(utf8_to_wstring(toolParameters.at(0)),utf8_to_wstring(toolParameters.at(1)));
            }
            if(toolCall==L"replace-file"){
                if(toolParameters.size()<4){
                    toolResponse=L"{\"error\":\"replace-file requires 4 parameters: path,startLine,endLine,newContent\"}";
                }
                else{
                    try{
                        std::wstring path=utf8_to_wstring(toolParameters.at(0));
                        int startLine=std::stoi(toolParameters.at(1));
                        int endLine=std::stoi(toolParameters.at(2));
                        std::wstring newContent=utf8_to_wstring(toolParameters.at(3));
                        toolResponse=stageReplace(path,startLine,endLine,newContent);
                    }catch(const std::exception& e){
                        toolResponse=utf8_to_wstring(json{{"error","Invalid parameters: "+std::string(e.what())}}.dump());
                    }
                }
            }
            if(toolCall==L"get-time"){
                toolResponse=getTime();
            }
            if(toolCall==L"run-exe"){
                toolResponse=runExe(utf8_to_wstring(toolParameters.at(0)));
            }
            if(toolResponse.empty()){
                toolResponse=L"{\"error\":\"tool returned empty\"}";
            }
            history.push_back({"tool",wstring_to_utf8(toolResponse)});
            usedTool=true;
        }
        else{
            ColorText(cc.ai_response);
            std::cout<<wstring_to_utf8(assistantName)<<":";
            std::cout.flush();
            ColorText(cc.reset);
            std::cout<<wstring_to_utf8(resp)<<std::endl;
        }
    }
    return 0;
}
```