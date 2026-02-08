import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Upload, Database, Brain, Zap, FileText, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createN8nAPI } from "@/utils/n8n-api";

export interface TrainingDataset {
  id: string;
  name: string;
  type: 'conversational' | 'task-specific' | 'domain-knowledge';
  format: 'jsonl' | 'csv' | 'text';
  size: number;
  sampleCount: number;
  created: Date;
  lastModified: Date;
  status: 'ready' | 'processing' | 'error';
}

export interface TrainingJob {
  id: string;
  name: string;
  baseModel: string;
  dataset: TrainingDataset;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  currentEpoch: number;
  totalEpochs: number;
  loss?: number;
  accuracy?: number;
  estimatedTimeRemaining?: number;
  created: Date;
  completed?: Date;
}

export const LocalTrainingStudio = () => {
  const { toast } = useToast();
  const [datasets, setDatasets] = useState<TrainingDataset[]>([]);
  const [trainingJobs, setTrainingJobs] = useState<TrainingJob[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [n8nAPI] = useState(() => createN8nAPI());

  // Training configuration
  const [selectedDataset, setSelectedDataset] = useState<string>('');
  const [baseModel, setBaseModel] = useState<string>('llama-3-8b-instruct');
  const [epochs, setEpochs] = useState<number>(3);
  const [batchSize, setBatchSize] = useState<number>(4);
  const [learningRate, setLearningRate] = useState<number>(0.0001);

  useEffect(() => {
    // Load existing datasets and training jobs
    loadTrainingData();
  }, []);

  const loadTrainingData = () => {
    // Load from localStorage for now
    const storedDatasets = localStorage.getItem('adaptive-agent-training-datasets');
    const storedJobs = localStorage.getItem('adaptive-agent-training-jobs');

    if (storedDatasets) {
      const parsedDatasets = JSON.parse(storedDatasets).map((d: any) => ({
        ...d,
        created: new Date(d.created),
        lastModified: new Date(d.lastModified)
      }));
      setDatasets(parsedDatasets);
    }

    if (storedJobs) {
      const parsedJobs = JSON.parse(storedJobs).map((j: any) => ({
        ...j,
        created: new Date(j.created),
        completed: j.completed ? new Date(j.completed) : undefined
      }));
      setTrainingJobs(parsedJobs);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // Basic file validation
      const allowedTypes = ['application/json', 'text/csv', 'text/plain'];
      if (!allowedTypes.includes(file.type) && !file.name.endsWith('.jsonl')) {
        throw new Error('Unsupported file type. Please use JSONL, CSV, or TXT files.');
      }

      // Create dataset entry
      const newDataset: TrainingDataset = {
        id: `dataset-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ""),
        type: 'conversational', // Default, can be changed later
        format: file.name.endsWith('.jsonl') ? 'jsonl' : file.name.endsWith('.csv') ? 'csv' : 'text',
        size: file.size,
        sampleCount: 0, // Will be calculated after processing
        created: new Date(),
        lastModified: new Date(),
        status: 'processing'
      };

      // Add to datasets
      const updatedDatasets = [...datasets, newDataset];
      setDatasets(updatedDatasets);
      localStorage.setItem('adaptive-agent-training-datasets', JSON.stringify(updatedDatasets));

      // Simulate file processing
      setTimeout(() => {
        newDataset.status = 'ready';
        newDataset.sampleCount = Math.floor(Math.random() * 1000) + 100; // Mock count
        setDatasets([...updatedDatasets]);
        localStorage.setItem('adaptive-agent-training-datasets', JSON.stringify(updatedDatasets));

        toast({
          title: "Dataset Uploaded",
          description: `${newDataset.name} is ready for training with ${newDataset.sampleCount} samples.`,
        });
      }, 2000);

    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const startTraining = async () => {
    if (!selectedDataset) {
      toast({
        title: "No Dataset Selected",
        description: "Please select a training dataset first.",
        variant: "destructive",
      });
      return;
    }

    const dataset = datasets.find(d => d.id === selectedDataset);
    if (!dataset) return;

    setIsTraining(true);

    const newJob: TrainingJob = {
      id: `job-${Date.now()}`,
      name: `${dataset.name} Training`,
      baseModel,
      dataset,
      status: 'running',
      progress: 0,
      currentEpoch: 0,
      totalEpochs: epochs,
      created: new Date(),
    };

    const updatedJobs = [...trainingJobs, newJob];
    setTrainingJobs(updatedJobs);
    localStorage.setItem('adaptive-agent-training-jobs', JSON.stringify(updatedJobs));

    // Simulate training process
    let currentEpoch = 0;
    const trainingInterval = setInterval(async () => {
      currentEpoch++;
      const progress = (currentEpoch / epochs) * 100;

      newJob.currentEpoch = currentEpoch;
      newJob.progress = progress;
      newJob.loss = Math.random() * 2 + 0.1; // Mock loss
      newJob.accuracy = Math.min(0.95, 0.5 + (currentEpoch / epochs) * 0.4); // Mock accuracy

      if (currentEpoch >= epochs) {
        newJob.status = 'completed';
        newJob.completed = new Date();
        clearInterval(trainingInterval);
        setIsTraining(false);

        // Trigger n8n workflow updates
        const trainingResult = {
          modelName: baseModel,
          accuracy: newJob.accuracy,
          loss: newJob.loss,
          epochs: currentEpoch,
          trainingJobId: newJob.id
        };

        try {
          await n8nAPI.triggerTrainingUpdate(newJob.id, trainingResult);
          toast({
            title: "Training Completed",
            description: `Model trained successfully with ${newJob.accuracy?.toFixed(2)} accuracy. Workflows updated automatically.`,
          });
        } catch (error) {
          toast({
            title: "Training Completed with Warning",
            description: `Model trained successfully, but workflow updates failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            variant: "destructive",
          });
        }
      }

      setTrainingJobs([...updatedJobs]);
      localStorage.setItem('adaptive-agent-training-jobs', JSON.stringify(updatedJobs));
    }, 2000);
  };

  const availableModels = [
    'llama-3-8b-instruct',
    'llama-3-70b-instruct',
    'mistral-7b-instruct',
    'codellama-7b-instruct',
    'phi-3-mini-4k-instruct'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Brain className="h-6 w-6 text-blue-500" />
        <h2 className="text-2xl font-bold">Local Training Studio</h2>
        <Badge variant="secondary">Beta</Badge>
      </div>

      <Alert>
        <Zap className="h-4 w-4" />
        <AlertDescription>
          Train AI models locally on your device. Fine-tune existing models with your own data while maintaining complete privacy.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="datasets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="datasets">Training Data</TabsTrigger>
          <TabsTrigger value="training">Model Training</TabsTrigger>
          <TabsTrigger value="jobs">Training Jobs</TabsTrigger>
        </TabsList>

        <TabsContent value="datasets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Training Data
              </CardTitle>
              <CardDescription>
                Upload datasets in JSONL, CSV, or text format for model training
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".jsonl,.csv,.txt,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="dataset-upload"
                  disabled={isUploading}
                />
                <label htmlFor="dataset-upload" className="cursor-pointer">
                  <div className="space-y-2">
                    {isUploading ? (
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                    ) : (
                      <Upload className="h-8 w-8 mx-auto text-gray-400" />
                    )}
                    <p className="text-sm text-gray-600">
                      {isUploading ? 'Processing...' : 'Click to upload training data'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Supports JSONL, CSV, and text files
                    </p>
                  </div>
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Available Datasets
              </CardTitle>
            </CardHeader>
            <CardContent>
              {datasets.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No datasets uploaded yet</p>
              ) : (
                <div className="space-y-2">
                  {datasets.map((dataset) => (
                    <div key={dataset.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="font-medium">{dataset.name}</p>
                          <p className="text-sm text-gray-500">
                            {dataset.format.toUpperCase()} • {dataset.sampleCount} samples • {(dataset.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <Badge variant={dataset.status === 'ready' ? 'default' : 'secondary'}>
                        {dataset.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Training Configuration
              </CardTitle>
              <CardDescription>
                Configure your model training parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dataset">Training Dataset</Label>
                  <Select value={selectedDataset} onValueChange={setSelectedDataset}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select dataset" />
                    </SelectTrigger>
                    <SelectContent>
                      {datasets.filter(d => d.status === 'ready').map((dataset) => (
                        <SelectItem key={dataset.id} value={dataset.id}>
                          {dataset.name} ({dataset.sampleCount} samples)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Base Model</Label>
                  <Select value={baseModel} onValueChange={setBaseModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="epochs">Epochs</Label>
                  <Input
                    id="epochs"
                    type="number"
                    value={epochs}
                    onChange={(e) => setEpochs(parseInt(e.target.value))}
                    min={1}
                    max={10}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batchSize">Batch Size</Label>
                  <Input
                    id="batchSize"
                    type="number"
                    value={batchSize}
                    onChange={(e) => setBatchSize(parseInt(e.target.value))}
                    min={1}
                    max={16}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="learningRate">Learning Rate</Label>
                  <Input
                    id="learningRate"
                    type="number"
                    value={learningRate}
                    onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                    step={0.00001}
                    min={0.00001}
                    max={0.01}
                  />
                </div>
              </div>

              <Button
                onClick={startTraining}
                disabled={!selectedDataset || isTraining}
                className="w-full"
              >
                {isTraining ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Training in Progress...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Start Training
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Training Jobs</CardTitle>
              <CardDescription>
                Monitor and manage your model training jobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trainingJobs.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No training jobs yet</p>
              ) : (
                <div className="space-y-4">
                  {trainingJobs.map((job) => (
                    <Card key={job.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{job.name}</h4>
                          <Badge variant={
                            job.status === 'completed' ? 'default' :
                            job.status === 'running' ? 'secondary' :
                            job.status === 'failed' ? 'destructive' : 'outline'
                          }>
                            {job.status}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{job.progress.toFixed(1)}%</span>
                          </div>
                          <Progress value={job.progress} />

                          {job.status === 'running' && (
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>Epoch: {job.currentEpoch}/{job.totalEpochs}</div>
                              <div>Loss: {job.loss?.toFixed(4)}</div>
                              <div>Accuracy: {job.accuracy?.toFixed(2)}</div>
                              <div>ETA: {job.estimatedTimeRemaining || 'Calculating...'}</div>
                            </div>
                          )}

                          {job.status === 'completed' && (
                            <div className="text-sm text-green-600">
                              Training completed with {job.accuracy?.toFixed(2)} accuracy
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};