          {/* Campaign Materials Section - Enhanced with Annotations */}
          {campaignAssets && campaignAssets.length > 0 ? (
            <div className="space-y-6">
              {/* Media Controls Bar */}
              <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-white/10">
                <div className="flex items-center space-x-4">
                  <h3 className="text-white font-medium">Campaign Materials</h3>
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                    {campaignAssets.length} {campaignAssets.length === 1 ? 'Asset' : 'Assets'}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => setIsAnnotating(!isAnnotating)}
                    variant={isAnnotating ? "default" : "outline"}
                    size="sm"
                    className={isAnnotating ? "bg-blue-600 hover:bg-blue-700" : "border-white/20 text-white hover:bg-white/10"}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {isAnnotating ? 'Exit Annotation Mode' : 'Add Annotations'}
                  </Button>
                  {annotations.length > 0 && (
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                      {annotations.length} {annotations.length === 1 ? 'Note' : 'Notes'}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Media Assets Grid */}
              <div className="space-y-8">
                {campaignAssets.map((asset: any, index: number) => (
                  <Card key={index} className="border border-white/10 bg-white/5 overflow-hidden">
                    <CardContent className="p-0">
                      {asset.fileType?.startsWith('image/') ? (
                        <div className="space-y-4">
                          {/* Image Header */}
                          <div className="p-4 bg-gray-800/30 border-b border-white/10">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <ImageIcon className="w-5 h-5 text-blue-400" />
                                <div>
                                  <h4 className="text-white font-medium">{asset.fileName}</h4>
                                  <p className="text-white/60 text-sm">Image • Click to annotate specific areas</p>
                                </div>
                              </div>
                              {isAnnotating && (
                                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  Click to Add Note
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {/* Image Display */}
                          <div className="relative px-4">
                            <img 
                              ref={el => imageRefs.current[asset.id] = el}
                              src={asset.fileUrl} 
                              alt={asset.fileName} 
                              className={`w-full max-h-96 object-contain rounded-lg ${isAnnotating ? 'cursor-crosshair' : ''}`}
                              onClick={(e) => handleImageClick(e, asset.id)}
                            />
                            
                            {/* Image Annotations */}
                            {annotations.filter(a => a.assetId === asset.id && a.type === 'image').map((annotation) => (
                              <div 
                                key={annotation.id}
                                className="absolute"
                                style={{ 
                                  left: `${annotation.x}%`, 
                                  top: `${annotation.y}%`,
                                  transform: 'translate(-50%, -50%)'
                                }}
                              >
                                <div className="bg-red-500 w-3 h-3 rounded-full border-2 border-white shadow-lg"></div>
                                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white p-2 rounded text-xs w-48 z-10">
                                  {annotation.note}
                                  <Button
                                    onClick={() => removeAnnotation(annotation.id)}
                                    size="sm"
                                    className="ml-2 p-1 h-auto bg-red-600 hover:bg-red-700"
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="px-4 pb-4">
                            <a 
                              href={asset.fileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 underline text-sm"
                            >
                              Open image in new tab
                            </a>
                          </div>
                        </div>
                      ) : asset.fileType?.startsWith('video/') ? (
                        <div className="space-y-4">
                          {/* Video Header */}
                          <div className="p-4 bg-gray-800/30 border-b border-white/10">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Video className="w-5 h-5 text-green-400" />
                                <div>
                                  <h4 className="text-white font-medium">{asset.fileName}</h4>
                                  <p className="text-white/60 text-sm">Video • Pause to add timestamped notes</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  onClick={() => togglePlayPause(asset.id, 'video')}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  {isPlaying[asset.id] ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                </Button>
                                <Button
                                  onClick={() => addVideoAnnotation(asset.id)}
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  <Plus className="w-4 h-4 mr-1" />
                                  Add Note
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          {/* Video Display */}
                          <div className="px-4">
                            <video 
                              ref={el => videoRefs.current[asset.id] = el}
                              src={asset.fileUrl} 
                              controls
                              preload="metadata"
                              className="w-full max-h-96 rounded-lg bg-black"
                              onTimeUpdate={(e) => handleVideoTimeUpdate(asset.id, e.currentTarget.currentTime)}
                            />
                            
                            {/* Video Annotations Timeline */}
                            {annotations.filter(a => a.assetId === asset.id && a.type === 'video').length > 0 && (
                              <div className="mt-4 space-y-2">
                                <h5 className="text-white text-sm font-medium">Video Notes:</h5>
                                {annotations.filter(a => a.assetId === asset.id && a.type === 'video').map((annotation) => (
                                  <div key={annotation.id} className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                                    <div className="flex items-center space-x-2">
                                      <Badge className="bg-blue-500/20 text-blue-300">
                                        {Math.floor(annotation.timestamp! / 60)}:{(annotation.timestamp! % 60).toFixed(0).padStart(2, '0')}
                                      </Badge>
                                      <span className="text-white/80 text-sm">{annotation.note}</span>
                                    </div>
                                    <Button
                                      onClick={() => removeAnnotation(annotation.id)}
                                      size="sm"
                                      className="p-1 h-auto bg-red-600 hover:bg-red-700"
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="px-4 pb-4">
                            <a 
                              href={asset.fileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 underline text-sm"
                            >
                              Open video in new tab
                            </a>
                          </div>
                        </div>
                      ) : asset.fileType?.startsWith('audio/') ? (
                        <div className="space-y-4">
                          {/* Audio Header */}
                          <div className="p-4 bg-gray-800/30 border-b border-white/10">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Headphones className="w-5 h-5 text-purple-400" />
                                <div>
                                  <h4 className="text-white font-medium">{asset.fileName}</h4>
                                  <p className="text-white/60 text-sm">Audio • Pause to add timestamped notes</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  onClick={() => togglePlayPause(asset.id, 'audio')}
                                  size="sm"
                                  className="bg-purple-600 hover:bg-purple-700"
                                >
                                  {isPlaying[asset.id] ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                </Button>
                                <Button
                                  onClick={() => addAudioAnnotation(asset.id)}
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  <Plus className="w-4 h-4 mr-1" />
                                  Add Note
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          {/* Audio Display */}
                          <div className="px-4">
                            <div className="p-6 bg-gray-800/50 rounded-lg">
                              <audio 
                                ref={el => audioRefs.current[asset.id] = el}
                                src={asset.fileUrl} 
                                controls
                                preload="metadata"
                                className="w-full"
                              />
                            </div>
                            
                            {/* Audio Annotations Timeline */}
                            {annotations.filter(a => a.assetId === asset.id && a.type === 'audio').length > 0 && (
                              <div className="mt-4 space-y-2">
                                <h5 className="text-white text-sm font-medium">Audio Notes:</h5>
                                {annotations.filter(a => a.assetId === asset.id && a.type === 'audio').map((annotation) => (
                                  <div key={annotation.id} className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                                    <div className="flex items-center space-x-2">
                                      <Badge className="bg-purple-500/20 text-purple-300">
                                        {Math.floor(annotation.timestamp! / 60)}:{(annotation.timestamp! % 60).toFixed(0).padStart(2, '0')}
                                      </Badge>
                                      <span className="text-white/80 text-sm">{annotation.note}</span>
                                    </div>
                                    <Button
                                      onClick={() => removeAnnotation(annotation.id)}
                                      size="sm"
                                      className="p-1 h-auto bg-red-600 hover:bg-red-700"
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="px-4 pb-4">
                            <a 
                              href={asset.fileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 underline text-sm"
                            >
                              Open audio file directly
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4">
                          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-white/10">
                            <div className="flex items-center space-x-3">
                              <ExternalLink className="w-5 h-5 text-orange-400" />
                              <div>
                                <h4 className="text-white font-medium">{asset.fileName}</h4>
                                <p className="text-white/60 text-sm">External Content • Click to view</p>
                              </div>
                            </div>
                            <a 
                              href={asset.fileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span>Open Content</span>
                            </a>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <Card className="border border-white/10 bg-white/5">
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-white/30 mx-auto mb-4" />
                  <p className="text-white/70">No campaign materials available yet.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Annotation Input Modal */}
          {selectedAsset && currentAnnotation.id && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="border border-white/10 bg-gray-900 w-full max-w-md mx-4">
                <CardHeader>
                  <CardTitle className="text-white">Add Annotation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-white/60">
                      {currentAnnotation.type === 'image' && 'Click position noted'}
                      {currentAnnotation.type === 'video' && `Timestamp: ${Math.floor(currentAnnotation.timestamp! / 60)}:${(currentAnnotation.timestamp! % 60).toFixed(0).padStart(2, '0')}`}
                      {currentAnnotation.type === 'audio' && `Timestamp: ${Math.floor(currentAnnotation.timestamp! / 60)}:${(currentAnnotation.timestamp! % 60).toFixed(0).padStart(2, '0')}`}
                    </div>
                    <Textarea
                      placeholder="Enter your note or feedback..."
                      className="bg-gray-800 border-white/10 text-white"
                      rows={3}
                      value={currentAnnotation.note || ''}
                      onChange={(e) => setCurrentAnnotation(prev => ({ ...prev, note: e.target.value }))}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button 
                        onClick={() => {
                          setCurrentAnnotation({});
                          setSelectedAsset(null);
                          setIsAnnotating(false);
                        }}
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={() => saveAnnotation(currentAnnotation.note || '')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Save Note
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}