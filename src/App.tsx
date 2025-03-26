import { useState } from "react";
import {
	DeleteOutlined,
	DownloadOutlined,
	LoadingOutlined,
	InboxOutlined,
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
			console.log("Envoi de la requête à l'API...");
			const response = await fetch("/api/remove-bg", {
				method: "POST",
				body: formData,
				headers: {
					Accept: "application/json",
				},
			});

			console.log("Statut de la réponse:", response.status);

			if (!response.ok) {
				const errorData = await response.json().catch(() => null);
				console.error("Erreur de l'API:", errorData);
				throw new Error(errorData?.error || `Erreur HTTP: ${response.status}`);
			}

			const data = await response.json();
			console.log("Réponse reçue:", data);

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
				className="main-container"
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
				}}
			>
				<div
					className="card-container"
					style={{
						width: "100%",
						maxWidth: "42rem",
						flexShrink: 0,
					}}
				>
					{!preview && !processedImage ? (
						<Card
							className="card"
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
							}}
						>
							<div style={{ textAlign: "center", width: "100%" }}>
								<Title
									level={1}
									className="title"
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
									}}
								>
									BG Wiper
								</Title>
								<Dragger {...uploadProps}>
									<p className="ant-upload-drag-icon">
										<InboxOutlined
											className="upload-icon"
											style={{
												color: "#3b82f6",
												fontSize: "3rem",
											}}
										/>
									</p>
									<p
										className="ant-upload-text upload-text"
										style={{
											color: "#a1a1aa",
											fontSize: "1.25rem",
										}}
									>
										Glissez-déposez votre image ici ou cliquez pour sélectionner
									</p>
									<p
										className="ant-upload-hint upload-hint"
										style={{
											color: "#71717a",
										}}
									>
										Formats acceptés : JPEG, PNG (max 5 Mo)
									</p>
									<p
										className="ant-upload-hint upload-hint"
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
								}}
							>
								<img
									src={processedImage || preview || undefined}
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
									}}
								>
									<Button
										className="delete-button"
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
										className="download-button"
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
					className="dedication-card"
					style={{
						width: "300px",
						flexShrink: 0,
						background: "rgba(24, 24, 27, 0.8)",
						backdropFilter: "blur(10px)",
						border: "1px solid rgba(39, 39, 42, 0.5)",
						borderRadius: "2rem",
						boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
						transition: "all 0.3s ease",
					}}
				>
					<div style={{ textAlign: "center" }}>
						<HeartOutlined
							style={{
								fontSize: "2rem",
								color: "#3b82f6",
							}}
						/>
						<Title
							level={3}
							style={{
								color: "white",
								marginTop: "1rem",
							}}
						>
							Crée avec ❤️
						</Title>
						<Text
							style={{
								color: "#a1a1aa",
							}}
						>
							par{" "}
							<a
								className="dedication-link"
								href="https://www.marius-djenontin.com/"
								target="_blank"
								rel="noopener noreferrer"
								style={{
									color: "#3b82f6",
									textDecoration: "none",
									fontWeight: "bold",
									transition: "all 0.3s ease",
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
								}}
							/>
							<Text>Développé en 5 minutes ⚡</Text>
						</Space>
					</div>
				</Card>
			</div>
		</ConfigProvider>
	);
}

export default App;
