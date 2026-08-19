/// <reference lib="webworker" />

import { pipeline, type AutomaticSpeechRecognitionPipeline } from "@huggingface/transformers";

type WorkerRequest={type:"prepare"}|{type:"transcribe";audio:Float32Array};

const workerScope=self as DedicatedWorkerGlobalScope;
let transcriberPromise:Promise<AutomaticSpeechRecognitionPipeline>|null=null;
const createSpeechPipeline=pipeline as unknown as (task:"automatic-speech-recognition",model:string,options:{device:"wasm";dtype:"q8"})=>Promise<AutomaticSpeechRecognitionPipeline>;

async function getTranscriber(){
  if(!transcriberPromise){
    workerScope.postMessage({type:"status",status:"loading"});
    transcriberPromise=createSpeechPipeline("automatic-speech-recognition","onnx-community/whisper-tiny.en",{
      device:"wasm",
      dtype:"q8",
    });
  }
  const transcriber=await transcriberPromise;
  workerScope.postMessage({type:"status",status:"ready"});
  return transcriber;
}

workerScope.onmessage=(event:MessageEvent<WorkerRequest>)=>{
  const request=event.data;
  if(request.type==="prepare"){
    void getTranscriber().catch(reportFailure);
    return;
  }
  void (async()=>{
    try{
      const transcriber=await getTranscriber();
      workerScope.postMessage({type:"status",status:"transcribing"});
      const output=await transcriber(request.audio);
      const text=Array.isArray(output)?output.map((item)=>item.text).join(" "):output.text;
      workerScope.postMessage({type:"result",text});
    }catch(error){reportFailure(error);}
  })();
};

function reportFailure(error:unknown){
  transcriberPromise=null;
  console.error("Local Whisper transcription failed",error);
  workerScope.postMessage({type:"error",message:"The local speech model could not load. Check the connection once for the first model download, refresh the page, and try again."});
}

export {};
