import { useState } from "react";
import {
	InboxOutlined,
	HeartOutlined,
	RocketOutlined,
} from "@ant-design/icons";
import {
	Button,
	Upload as AntUpload,
	message,
	Typography,
	Card,
	Space,
	ConfigProvider,
	theme,
	Divider,
	Alert,
} from "antd";
import "./styles.css";

const { Title, Text } = Typography;

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
				mode: "cors",
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

	const handleDelete = () => {
		setSelectedFile(null);
		setPreview(null);
		setProcessedImage(null);
	};

	const uploadProps = {
		beforeUpload: handleFileSelect,
		showUploadList: false,
		accept: "image/jpeg,image/png",
		disabled: isUploading,
	};

	const styles = {
		container: {
			maxWidth: "800px",
			margin: "0 auto",
			padding: "20px",
			textAlign: "center" as const,
		},
		title: {
			fontSize: "2.5rem",
			marginBottom: "2rem",
			color: "#1890ff",
		},
		uploadArea: {
			width: "100%",
			height: "300px",
			display: "flex",
			flexDirection: "column" as const,
			justifyContent: "center",
			alignItems: "center",
			border: "2px dashed #d9d9d9",
			borderRadius: "8px",
			backgroundColor: "#fafafa",
			cursor: "pointer",
			transition: "all 0.3s",
		},
		uploadIcon: {
			fontSize: "48px",
			color: "#1890ff",
			marginBottom: "16px",
		},
		uploadText: {
			fontSize: "16px",
			color: "#666",
			marginBottom: "8px",
		},
		uploadHint: {
			fontSize: "14px",
			color: "#999",
		},
		previewContainer: {
			width: "100%",
			maxWidth: "500px",
			margin: "20px auto",
			display: "flex",
			flexDirection: "column" as const,
			alignItems: "center",
			gap: "16px",
		},
		previewImage: {
			width: "100%",
			height: "300px",
			objectFit: "contain" as const,
			borderRadius: "8px",
			backgroundColor: "#fafafa",
		},
		removeButton: {
			marginTop: "16px",
		},
		downloadButton: {
			marginTop: "16px",
		},
		deleteButton: {
			marginTop: "16px",
			backgroundColor: "#ff4d4f",
			borderColor: "#ff4d4f",
		},
		deleteButtonHover: {
			backgroundColor: "#ff7875",
			borderColor: "#ff7875",
		},
		dedicationLink: {
			color: "#1890ff",
			textDecoration: "none",
			marginTop: "20px",
			display: "inline-block",
		},
		dedicationLinkHover: {
			color: "#40a9ff",
		},
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
					<div style={styles.container}>
						<h1 style={styles.title}>BG Wiper</h1>
						<AntUpload.Dragger {...uploadProps} style={styles.uploadArea}>
							<InboxOutlined style={styles.uploadIcon} />
							<p style={styles.uploadText}>
								Cliquez ou glissez-déposez une image ici
							</p>
							<p style={styles.uploadHint}>
								Supporte les formats JPEG et PNG jusqu'à 5 Mo
							</p>
						</AntUpload.Dragger>

						{error && (
							<Alert
								message="Erreur"
								description={error}
								type="error"
								showIcon
								style={{ marginTop: "20px" }}
							/>
						)}

						{preview && (
							<div style={styles.previewContainer}>
								<img src={preview} alt="Aperçu" style={styles.previewImage} />
								<Button
									type="primary"
									onClick={handleRemoveBackground}
									loading={isLoading}
									style={styles.removeButton}
								>
									Supprimer le fond
								</Button>
							</div>
						)}

						{processedImage && (
							<div style={styles.previewContainer}>
								<img
									src={processedImage}
									alt="Image traitée"
									style={styles.previewImage}
								/>
								<Button
									type="primary"
									onClick={handleDownload}
									style={styles.downloadButton}
								>
									Télécharger
								</Button>
								<Button
									danger
									onClick={handleDelete}
									style={styles.deleteButton}
								>
									Supprimer
								</Button>
							</div>
						)}

						<a
							href="https://www.linkedin.com/in/marius-djen/"
							target="_blank"
							rel="noopener noreferrer"
							style={styles.dedicationLink}
						>
							Fait avec ❤️ par Marius Djen
						</a>
					</div>
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
