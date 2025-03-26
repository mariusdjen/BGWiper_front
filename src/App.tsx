import { useState } from "react";
import {
	DeleteOutlined,
	DownloadOutlined,
	LoadingOutlined,
	InboxOutlined,
	ReloadOutlined,
	HeartOutlined,
	RocketOutlined,
	CheckCircleOutlined,
} from "@ant-design/icons";
import {
	Button,
	Upload as AntUpload,
	message,
	Spin,
	Typography,
	Card,
	Space,
	ConfigProvider,
	theme,
	Divider,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import "./styles.css";

const { Title, Text } = Typography;
const { Dragger } = AntUpload;

function App() {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [preview, setPreview] = useState<string | null>(null);
	const [processedImage, setProcessedImage] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleFileSelect = async (file: File) => {
		if (file.size > 5 * 1024 * 1024) {
			message.error("L'image ne doit pas dépasser 5 Mo");
			return false;
		}
		if (!file.type.match("image/(jpeg|png)")) {
			message.error("Format d'image non supporté. Utilisez JPEG ou PNG");
			return false;
		}
		setIsUploading(true);
		setSelectedFile(file);
		setError(null);
		const reader = new FileReader();
		reader.onloadend = () => {
			setPreview(reader.result as string);
			setIsUploading(false);
		};
		reader.readAsDataURL(file);
		return false;
	};

	const handleRemoveBackground = async () => {
		if (!selectedFile) return;

		setIsLoading(true);
		setError(null);

		const formData = new FormData();
		formData.append("image", selectedFile);

		try {
			const response = await fetch("/api/remove-bg", {
				method: "POST",
				body: formData,
				headers: {
					Accept: "application/json",
				},
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => null);
				throw new Error(errorData?.error || `Erreur HTTP: ${response.status}`);
			}

			const data = await response.json();

			if (!data.no_bg_image_url) {
				throw new Error("L'URL de l'image traitée n'a pas été reçue");
			}

			setProcessedImage(data.no_bg_image_url);
		} catch (err) {
			console.error("Erreur lors du traitement:", err);
			setError(
				err instanceof Error
					? err.message
					: "Une erreur est survenue lors de la communication avec le serveur"
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleDownload = () => {
		if (!processedImage) return;

		const a = document.createElement("a");
		a.href = processedImage;
		a.download = "image-sans-fond.png";
		a.rel = "noopener noreferrer";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	};

	const uploadProps = {
		beforeUpload: handleFileSelect,
		showUploadList: false,
		accept: "image/jpeg,image/png",
		disabled: isUploading,
	};

	return (
		<ConfigProvider
			theme={{
				algorithm: theme.darkAlgorithm,
				token: {
					colorPrimary: "#3b82f6",
					borderRadius: 16,
				},
			}}
		>
			<div
				style={{
					minHeight: "100vh",
					width: "100%",
					background: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
					padding: "1rem",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					gap: "2rem",
					boxSizing: "border-box",
					overflow: "hidden",
					flexDirection: "row",
					flexWrap: "wrap",
					"@media (max-width: 768px)": {
						flexDirection: "column",
						padding: "0.5rem",
						gap: "1rem",
					},
				}}
			>
				<div
					style={{
						width: "100%",
						maxWidth: "42rem",
						flexShrink: 0,
						"@media (max-width: 768px)": {
							maxWidth: "100%",
							padding: "0 0.5rem",
						},
					}}
				>
					{!preview && !processedImage ? (
						<Card
							style={{
								aspectRatio: "1",
								background: "rgba(24, 24, 27, 0.8)",
								backdropFilter: "blur(10px)",
								border: "1px solid rgba(39, 39, 42, 0.5)",
								borderRadius: "2rem",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
								transition: "all 0.3s ease",
								":hover": {
									transform: "scale(1.02)",
									boxShadow: "0 12px 48px rgba(0, 0, 0, 0.4)",
								},
								"@media (max-width: 768px)": {
									borderRadius: "1rem",
									margin: "0 auto",
									maxWidth: "100%",
								},
							}}
						>
							<div style={{ textAlign: "center", width: "100%" }}>
								<Title
									level={1}
									style={{
										color: "white",
										marginBottom: "4rem",
										fontWeight: "bold",
										fontSize: "4rem",
										textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
										background:
											"linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
										WebkitBackgroundClip: "text",
										WebkitTextFillColor: "transparent",
										"@media (max-width: 768px)": {
											fontSize: "2.5rem",
											marginBottom: "2rem",
										},
									}}
								>
									BG Wiper
								</Title>
								<Dragger {...uploadProps}>
									<p className="ant-upload-drag-icon">
										<InboxOutlined
											style={{
												color: "#3b82f6",
												fontSize: "3rem",
												"@media (max-width: 768px)": {
													fontSize: "2rem",
												},
											}}
										/>
									</p>
									<p
										className="ant-upload-text"
										style={{
											color: "#a1a1aa",
											fontSize: "1.25rem",
											"@media (max-width: 768px)": {
												fontSize: "1rem",
											},
										}}
									>
										Glissez-déposez votre image ici ou cliquez pour sélectionner
									</p>
									<p
										className="ant-upload-hint"
										style={{
											color: "#71717a",
											"@media (max-width: 768px)": {
												fontSize: "0.875rem",
											},
										}}
									>
										Formats acceptés : JPEG, PNG (max 5 Mo)
									</p>
									<p
										className="ant-upload-hint"
										style={{
											background:
												"linear-gradient(135deg, #10b981 0%, #059669 100%)",
											WebkitBackgroundClip: "text",
											WebkitTextFillColor: "transparent",
											marginTop: "0.5rem",
											fontWeight: "500",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											gap: "0.5rem",
											"@media (max-width: 768px)": {
												fontSize: "0.875rem",
											},
										}}
									>
										<CheckCircleOutlined
											style={{
												fontSize: "1.1rem",
												background:
													"linear-gradient(135deg, #10b981 0%, #059669 100%)",
												WebkitBackgroundClip: "text",
												WebkitTextFillColor: "transparent",
											}}
										/>
										Qualité HD préservée • Résolution d'origine conservée
									</p>
								</Dragger>
							</div>
						</Card>
					) : (
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								gap: "1.5rem",
								"@media (max-width: 768px)": {
									gap: "1rem",
								},
							}}
						>
							<Card
								style={{
									aspectRatio: "1",
									background: "rgba(24, 24, 27, 0.8)",
									backdropFilter: "blur(10px)",
									border: "1px solid rgba(39, 39, 42, 0.5)",
									borderRadius: "2rem",
									position: "relative",
									boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
									transition: "all 0.3s ease",
									":hover": {
										transform: "scale(1.02)",
										boxShadow: "0 12px 48px rgba(0, 0, 0, 0.4)",
									},
									"@media (max-width: 768px)": {
										borderRadius: "1rem",
									},
								}}
							>
								<img
									src={processedImage || preview}
									alt={processedImage ? "Image traitée" : "Preview"}
									style={{
										width: "100%",
										height: "100%",
										objectFit: "contain",
									}}
								/>
								<div
									style={{
										position: "absolute",
										top: "2rem",
										right: "2rem",
										display: "flex",
										gap: "1rem",
										"@media (max-width: 768px)": {
											top: "1rem",
											right: "1rem",
										},
									}}
								>
									<Button
										icon={<DeleteOutlined />}
										onClick={() => {
											setSelectedFile(null);
											setPreview(null);
											setProcessedImage(null);
										}}
										style={{
											background: "rgba(39, 39, 42, 0.8)",
											border: "none",
											color: "white",
											backdropFilter: "blur(4px)",
											transition: "all 0.3s ease",
											":hover": {
												background: "rgba(239, 68, 68, 0.8)",
											},
											"@media (max-width: 768px)": {
												padding: "0.5rem",
											},
										}}
									>
										Supprimer
									</Button>
								</div>
							</Card>

							{error && (
								<Card
									style={{
										background: "rgba(127, 29, 29, 0.5)",
										border: "1px solid rgba(153, 27, 27, 0.5)",
										backdropFilter: "blur(4px)",
										animation: "fadeIn 0.3s ease",
										"@media (max-width: 768px)": {
											borderRadius: "0.5rem",
										},
									}}
								>
									<Text style={{ color: "#fecaca" }}>{error}</Text>
								</Card>
							)}

							<Space
								direction="vertical"
								style={{ width: "100%" }}
								size="large"
							>
								{selectedFile && !processedImage && (
									<Button
										type="primary"
										size="large"
										block
										onClick={handleRemoveBackground}
										disabled={isLoading}
										style={{
											height: "3.5rem",
											fontSize: "1.1rem",
											background:
												"linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
											border: "none",
											transition: "all 0.3s ease",
											":hover": {
												transform: "translateY(-2px)",
												boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
											},
											"@media (max-width: 768px)": {
												height: "3rem",
												fontSize: "1rem",
											},
										}}
									>
										{isLoading ? (
											<Spin
												indicator={
													<LoadingOutlined style={{ fontSize: 24 }} spin />
												}
											/>
										) : (
											"Supprimer le fond"
										)}
									</Button>
								)}
								{processedImage && (
									<Button
										type="primary"
										size="large"
										block
										onClick={handleDownload}
										icon={<DownloadOutlined />}
										style={{
											height: "3.5rem",
											fontSize: "1.1rem",
											background:
												"linear-gradient(135deg, #10b981 0%, #059669 100%)",
											border: "none",
											transition: "all 0.3s ease",
											":hover": {
												transform: "translateY(-2px)",
												boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
											},
											"@media (max-width: 768px)": {
												height: "3rem",
												fontSize: "1rem",
											},
										}}
									>
										Télécharger l'image
									</Button>
								)}
							</Space>
						</div>
					)}
				</div>

				{/* Section Dédicace */}
				<Card
					style={{
						width: "300px",
						flexShrink: 0,
						background: "rgba(24, 24, 27, 0.8)",
						backdropFilter: "blur(10px)",
						border: "1px solid rgba(39, 39, 42, 0.5)",
						borderRadius: "2rem",
						boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
						transition: "all 0.3s ease",
						":hover": {
							transform: "scale(1.02)",
							boxShadow: "0 12px 48px rgba(0, 0, 0, 0.4)",
						},
						"@media (max-width: 768px)": {
							width: "100%",
							borderRadius: "1rem",
							marginTop: "1rem",
						},
					}}
				>
					<div style={{ textAlign: "center" }}>
						<HeartOutlined
							style={{
								fontSize: "2rem",
								color: "#3b82f6",
								"@media (max-width: 768px)": {
									fontSize: "1.5rem",
								},
							}}
						/>
						<Title
							level={3}
							style={{
								color: "white",
								marginTop: "1rem",
								"@media (max-width: 768px)": {
									fontSize: "1.25rem",
								},
							}}
						>
							Crée avec ❤️
						</Title>
						<Text
							style={{
								color: "#a1a1aa",
								"@media (max-width: 768px)": {
									fontSize: "0.875rem",
								},
							}}
						>
							par{" "}
							<a
								href="https://www.marius-djenontin.com/"
								target="_blank"
								rel="noopener noreferrer"
								style={{
									color: "#3b82f6",
									textDecoration: "none",
									fontWeight: "bold",
									transition: "all 0.3s ease",
									":hover": {
										color: "#2563eb",
										textDecoration: "underline",
									},
								}}
							>
								Marius Dev
							</a>
						</Text>
						<Divider style={{ background: "rgba(255, 255, 255, 0.1)" }} />
						<Space direction="vertical" size="small">
							<RocketOutlined
								style={{
									fontSize: "1.5rem",
									color: "#3b82f6",
									"@media (max-width: 768px)": {
										fontSize: "1.25rem",
									},
								}}
							/>
							<Text
								style={{
									color: "#a1a1aa",
									"@media (max-width: 768px)": {
										fontSize: "0.875rem",
									},
								}}
							>
								Développé en 5 minutes ⚡
							</Text>
						</Space>
					</div>
				</Card>
			</div>
		</ConfigProvider>
	);
}

export default App;
