
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

const StoragePanel = () => {
  return (
    <div className="grid grid-cols-1 gap-4">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle>Storage Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="duckdb" className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="duckdb">DuckDB</TabsTrigger>
              <TabsTrigger value="chromadb">ChromaDB</TabsTrigger>
              <TabsTrigger value="sqlite">SQLite</TabsTrigger>
              <TabsTrigger value="minio">MinIO</TabsTrigger>
            </TabsList>
            
            <TabsContent value="duckdb">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium">Raw Interaction Data</h3>
                    <p className="text-sm text-slate-400">Time-series storage for trigger events</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-medium">258 MB</div>
                    <div className="text-xs text-slate-400">8,543 records</div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Storage Usage</span>
                    <span>25.8%</span>
                  </div>
                  <Progress value={25.8} className="h-1" />
                </div>
                
                <div className="bg-slate-900 p-3 rounded-md text-xs font-mono">
                  SELECT input, timestamp, context_flags<br/>
                  FROM interactions<br/>
                  WHERE timestamp > CURRENT_DATE - INTERVAL 1 DAY<br/>
                  ORDER BY timestamp DESC<br/>
                  LIMIT 10
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="chromadb">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium">Vector Knowledge Store</h3>
                    <p className="text-sm text-slate-400">Embedded knowledge representations</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-medium">512 MB</div>
                    <div className="text-xs text-slate-400">3,251 vectors</div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Storage Usage</span>
                    <span>51.2%</span>
                  </div>
                  <Progress value={51.2} className="h-1" />
                </div>
                
                <div className="bg-slate-900 p-3 rounded-md text-xs font-mono">
                  const results = await chromaDB.query({<br/>
                  &nbsp;&nbsp;collection: "knowledge_base",<br/>
                  &nbsp;&nbsp;query_embeddings: embeddings,<br/>
                  &nbsp;&nbsp;n_results: 5<br/>
                  });
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="sqlite">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium">Structured Data</h3>
                    <p className="text-sm text-slate-400">Relational storage for learning plans</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-medium">95 MB</div>
                    <div className="text-xs text-slate-400">1,427 records</div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Storage Usage</span>
                    <span>9.5%</span>
                  </div>
                  <Progress value={9.5} className="h-1" />
                </div>
                
                <div className="bg-slate-900 p-3 rounded-md text-xs font-mono">
                  CREATE TABLE lesson_plans (<br/>
                  &nbsp;&nbsp;id INTEGER PRIMARY KEY,<br/>
                  &nbsp;&nbsp;title TEXT,<br/>
                  &nbsp;&nbsp;content TEXT,<br/>
                  &nbsp;&nbsp;created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP<br/>
                  );
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="minio">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium">Object Storage</h3>
                    <p className="text-sm text-slate-400">Binary assets for learning materials</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-medium">1.2 GB</div>
                    <div className="text-xs text-slate-400">237 objects</div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Storage Usage</span>
                    <span>12.0%</span>
                  </div>
                  <Progress value={12} className="h-1" />
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="bg-slate-900 p-2 rounded-md text-xs">
                    <div className="flex items-center justify-between">
                      <span>PDFs</span>
                      <span className="text-slate-400">45 files</span>
                    </div>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-md text-xs">
                    <div className="flex items-center justify-between">
                      <span>Audio</span>
                      <span className="text-slate-400">83 files</span>
                    </div>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-md text-xs">
                    <div className="flex items-center justify-between">
                      <span>Images</span>
                      <span className="text-slate-400">102 files</span>
                    </div>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-md text-xs">
                    <div className="flex items-center justify-between">
                      <span>Other</span>
                      <span className="text-slate-400">7 files</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default StoragePanel;
